import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, QueryFailedError, Repository } from 'typeorm';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { Product } from '../products/entities/product.entity';
import { USER_ROLE, User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { normalizePersonName, normalizePhone } from '../users/utils/personal-data-normalizer';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { OrderItem } from './entities/order-item.entity';
import { ORDER_STATUS, Order } from './entities/order.entity';

const ORDER_STATUS_FLOW: ORDER_STATUS[] = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.IN_PROGRESS,
  ORDER_STATUS.READY,
  ORDER_STATUS.DELIVERED,
];

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createOne(payload: CreateOrderDto, authenticatedUserId?: number): Promise<Order> {
    return this.dataSource.transaction(async (transactionManager) => {
      const productIds = payload.items.map((item) => item.productId);
      const products = await transactionManager.getRepository(Product).find({
        where: { id: In(productIds) },
      });

      const productById = new Map<number, Product>();
      products.forEach((product) => {
        productById.set(product.id, product);
      });

      for (const item of payload.items) {
        if (!productById.has(item.productId)) {
          throw new NotFoundException(`Producto con id ${item.productId} no existe.`);
        }
      }

      const resolvedUser = await resolveOrderUser({
        payload,
        authenticatedUserId,
        transactionManager,
        usersRepository: this.usersRepository,
        usersService: this.usersService,
      });

      const orderRepository = transactionManager.getRepository(Order);

      const createdOrder = orderRepository.create({
        status: ORDER_STATUS.PENDING,
        type: payload.type,
        userId: resolvedUser.id,
        customerName: resolvedUser.name,
        customerPhone: resolvedUser.phone,
        deliveryDetails:
          payload.type === 'DELIVERY'
            ? {
                address: payload.address,
                zone: payload.zone,
                instructions: payload.instructions,
              }
            : undefined,
        items: payload.items.map((item) => {
          const product = productById.get(item.productId)!;
          return {
            productId: item.productId,
            quantity: item.quantity,
            price: Number(product.price ?? 0),
          };
        }),
      });

      return orderRepository.save(createdOrder);
    });
  }
  
  async findMany(
    query: QueryOrdersDto,
    currentUser?: { sub: number; role: USER_ROLE },
  ): Promise<PaginatedResponseDto<Order>> {
    const requestedPage = query.page ?? 1;
    const requestedPageSize = query.pageSize ?? 20;

    const normalizedPage = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const normalizedPageSize = Number.isInteger(requestedPageSize) && requestedPageSize > 0
      ? Math.min(requestedPageSize, 100)
      : 20;
    const requestedStatuses = query.statuses;

    const where: { status?: ReturnType<typeof In>; userId?: number } = {};
    if (requestedStatuses?.length) {
      const normalizedStatuses = mapStatusesForDatabaseQuery(requestedStatuses, ORDER_STATUS.READY);
      where.status = In(normalizedStatuses);
    }

    const canViewAllOrders =
      currentUser?.role === USER_ROLE.ADMIN || currentUser?.role === USER_ROLE.ASSISTANT;

    if (currentUser && !canViewAllOrders) {
      where.userId = currentUser.sub;
    }

    const findOptions = {
      relations: {
        user: true,
        deliveryDetails: true,
        items: {
          product: true,
        },
      },
      where: Object.keys(where).length ? where : undefined,
      skip: (normalizedPage - 1) * normalizedPageSize,
      take: normalizedPageSize,
      order: { id: 'DESC' },
    } as const;

    let results: Order[];
    let total: number;

    try {
      [results, total] = await this.ordersRepository.findAndCount(findOptions);
    } catch (error) {
      const shouldRetryWithLegacyConfirmed =
        requestedStatuses?.length &&
        includesReadyVariant(requestedStatuses) &&
        isInvalidOrderStatusEnumValueError(error);

      if (!shouldRetryWithLegacyConfirmed) {
        throw error;
      }

      where.status = In(mapStatusesForDatabaseQuery(requestedStatuses, ORDER_STATUS.CONFIRMED));
      [results, total] = await this.ordersRepository.findAndCount({
        ...findOptions,
        where,
      });
    }

    const normalizedResults = results.map(normalizeOrderStatusForClient);

    return {
      results: normalizedResults,
      meta: {
        page: normalizedPage,
        pageSize: normalizedPageSize,
        total,
        totalPage: Math.ceil(total / normalizedPageSize) || 1,
      },
    };
  }

  async advanceToNextStatus(id: number): Promise<Order> {
    return this.dataSource.transaction(async (transactionManager) => {
      const orderRepository = transactionManager.getRepository(Order);

      const lockedOrder = await orderRepository
        .createQueryBuilder('order')
        .where('order.id = :id', { id })
        .setLock('pessimistic_write')
        .getOne();

      if (!lockedOrder) {
        throw new NotFoundException(`Pedido con id ${id} no existe.`);
      }

      if (lockedOrder.status === ORDER_STATUS.CANCELLED) {
        throw new BadRequestException('No se puede avanzar un pedido cancelado.');
      }

      const nextStatus = getNextStatus(lockedOrder.status);
      if (!nextStatus) {
        throw new BadRequestException('El pedido ya se encuentra en su fase final.');
      }

      const orderWithRelations = await orderRepository.findOne({
        where: { id },
        relations: {
          deliveryDetails: true,
          items: true,
        },
      });

      if (!orderWithRelations) {
        throw new NotFoundException(`Pedido con id ${id} no existe.`);
      }

      if (nextStatus === ORDER_STATUS.IN_PROGRESS) {
        await ensureStockForOrderItems(orderWithRelations.items, transactionManager);
      }

      if (nextStatus === ORDER_STATUS.READY) {
        await discountStockForOrderItems(orderWithRelations.items, transactionManager);
      }

      const persistedStatus = await resolveStatusForDatabase(
        nextStatus,
        lockedOrder.status,
        transactionManager,
      );

      lockedOrder.status = persistedStatus;
      await orderRepository.save(lockedOrder);

      const updatedOrder = await orderRepository.findOne({
        where: { id },
        relations: {
          deliveryDetails: true,
          items: true,
        },
      });

      if (!updatedOrder) {
        throw new NotFoundException(`Pedido con id ${id} no existe.`);
      }

      return normalizeOrderStatusForClient(updatedOrder);
    });
  }

  async cancelOrder(id: number): Promise<Order> {
    return this.dataSource.transaction(async (transactionManager) => {
      const orderRepository = transactionManager.getRepository(Order);

      const lockedOrder = await orderRepository
        .createQueryBuilder('order')
        .where('order.id = :id', { id })
        .setLock('pessimistic_write')
        .getOne();

      if (!lockedOrder) {
        throw new NotFoundException(`Pedido con id ${id} no existe.`);
      }

      if (lockedOrder.status !== ORDER_STATUS.CANCELLED) {
        lockedOrder.status = ORDER_STATUS.CANCELLED;
        await orderRepository.save(lockedOrder);
      }

      const updatedOrder = await orderRepository.findOne({
        where: { id },
        relations: {
          deliveryDetails: true,
          items: true,
        },
      });

      if (!updatedOrder) {
        throw new NotFoundException(`Pedido con id ${id} no existe.`);
      }

      return normalizeOrderStatusForClient(updatedOrder);
    });
  }
}

async function resolveOrderUser(params: {
  payload: CreateOrderDto;
  authenticatedUserId?: number;
  transactionManager: DataSource['manager'];
  usersRepository: Repository<User>;
  usersService: UsersService;
}): Promise<{ id: number; name: string; phone: string }> {
  const { payload, authenticatedUserId, transactionManager, usersRepository, usersService } = params;

  if (authenticatedUserId || payload.userId) {
    const targetUserId = authenticatedUserId ?? payload.userId;
    const existingUser = await usersRepository.findOne({ where: { id: targetUserId } });

    if (!existingUser || !existingUser.isActive) {
      throw new NotFoundException(`Usuario con id ${targetUserId} no existe o esta inactivo.`);
    }

    return {
      id: existingUser.id,
      name: existingUser.name,
      phone: existingUser.phone ?? payload.customerPhone ?? 'sin-telefono',
    };
  }

  const customerName = payload.customerName?.trim();
  const customerPhone = payload.customerPhone?.trim();

  if (!customerName || !customerPhone) {
    throw new BadRequestException(
      'Debe enviar customerName y customerPhone cuando no hay usuario autenticado.',
    );
  }

  const normalizedName = normalizePersonName(customerName);
  const normalizedPhone = normalizePhone(customerPhone);

  const existingGuest = await transactionManager.getRepository(User).findOne({
    where: {
      role: USER_ROLE.CLIENT,
      isGuest: true,
      normalizedName,
      normalizedPhone,
    },
  });

  if (existingGuest) {
    return {
      id: existingGuest.id,
      name: existingGuest.name,
      phone: existingGuest.phone ?? normalizedPhone,
    };
  }

  const createdGuest = await usersService.createGuestUser(customerName, customerPhone);

  return {
    id: createdGuest.id,
    name: createdGuest.name,
    phone: createdGuest.phone ?? normalizedPhone,
  };
}

function getNextStatus(status: ORDER_STATUS): ORDER_STATUS | null {
  const normalizedStatus = status === ORDER_STATUS.CONFIRMED ? ORDER_STATUS.READY : status;
  const currentIndex = ORDER_STATUS_FLOW.indexOf(normalizedStatus);
  if (currentIndex < 0 || currentIndex === ORDER_STATUS_FLOW.length - 1) {
    return null;
  }

  return ORDER_STATUS_FLOW[currentIndex + 1];
}

function mapStatusesForDatabaseQuery(
  statuses: ORDER_STATUS[],
  readyStatus: ORDER_STATUS.READY | ORDER_STATUS.CONFIRMED,
): ORDER_STATUS[] {
  const mappedStatuses = statuses.map((status) => {
    if (status === ORDER_STATUS.READY || status === ORDER_STATUS.CONFIRMED) {
      return readyStatus;
    }

    return status;
  });

  return Array.from(new Set(mappedStatuses));
}

function includesReadyVariant(statuses: ORDER_STATUS[]): boolean {
  return statuses.includes(ORDER_STATUS.READY) || statuses.includes(ORDER_STATUS.CONFIRMED);
}

function isInvalidOrderStatusEnumValueError(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }

  const errorCode = (error as { code?: string }).code;
  const errorMessage = (error as { message?: string }).message ?? '';

  return errorCode === '22P02' && errorMessage.includes('order_status_enum');
}

function normalizeOrderStatusForClient(order: Order): Order {
  if (order.status !== ORDER_STATUS.CONFIRMED) {
    return order;
  }

  return {
    ...order,
    status: ORDER_STATUS.READY,
  };
}

function mapStatusForDatabase(nextStatus: ORDER_STATUS, currentStatus: ORDER_STATUS): ORDER_STATUS {
  if (nextStatus !== ORDER_STATUS.READY) {
    return nextStatus;
  }

  if (currentStatus === ORDER_STATUS.CONFIRMED) {
    return ORDER_STATUS.CONFIRMED;
  }

  return ORDER_STATUS.READY;
}

async function resolveStatusForDatabase(
  nextStatus: ORDER_STATUS,
  currentStatus: ORDER_STATUS,
  transactionManager: DataSource['manager'],
): Promise<ORDER_STATUS> {
  const candidateStatus = mapStatusForDatabase(nextStatus, currentStatus);

  if (candidateStatus !== ORDER_STATUS.READY) {
    return candidateStatus;
  }

  const readyValueExistsResult = await transactionManager.query(`
    SELECT EXISTS (
      SELECT 1
      FROM pg_enum enum
      JOIN pg_type type ON type.oid = enum.enumtypid
      JOIN pg_namespace namespace ON namespace.oid = type.typnamespace
      WHERE namespace.nspname = 'public'
        AND type.typname = 'order_status_enum'
        AND enum.enumlabel = 'READY'
    ) AS "exists"
  `);

  const readyValueExists = Boolean(readyValueExistsResult?.[0]?.exists);

  return readyValueExists ? ORDER_STATUS.READY : ORDER_STATUS.CONFIRMED;
}

async function discountStockForOrderItems(items: OrderItem[], transactionManager: DataSource['manager']): Promise<void> {
  const quantitiesByProductId = await getRequestedQuantitiesByProduct(items);

  for (const [productId, requestedQuantity] of quantitiesByProductId.entries()) {
    const product = await transactionManager
      .getRepository(Product)
      .createQueryBuilder('product')
      .where('product.id = :productId', { productId })
      .setLock('pessimistic_write')
      .getOne();

    if (!product) {
      throw new NotFoundException(`Producto con id ${productId} no existe.`);
    }

    if (product.population !== null && product.population !== undefined) {
      if (product.population < requestedQuantity) {
        throw new ConflictException(
          `Stock insuficiente para ${product.commonName}. Disponible: ${product.population}, solicitado: ${requestedQuantity}.`,
        );
      }
      product.population = product.population - requestedQuantity;
      await transactionManager.getRepository(Product).save(product);
    }
  }
}

async function ensureStockForOrderItems(items: OrderItem[], transactionManager: DataSource['manager']): Promise<void> {
  const quantitiesByProductId = await getRequestedQuantitiesByProduct(items);

  for (const [productId, requestedQuantity] of quantitiesByProductId.entries()) {
    const product = await transactionManager
      .getRepository(Product)
      .createQueryBuilder('product')
      .where('product.id = :productId', { productId })
      .setLock('pessimistic_write')
      .getOne();

    if (!product) {
      throw new NotFoundException(`Producto con id ${productId} no existe.`);
    }

    if (product.population !== null && product.population !== undefined) {
      if (product.population < requestedQuantity) {
        throw new ConflictException(
          `Stock insuficiente para ${product.commonName}. Disponible: ${product.population}, solicitado: ${requestedQuantity}.`,
        );
      }
    }
  }
}

async function getRequestedQuantitiesByProduct(items: OrderItem[]): Promise<Map<number, number>> {
  const quantitiesByProductId = new Map<number, number>();

  for (const item of items) {
    quantitiesByProductId.set(
      item.productId,
      (quantitiesByProductId.get(item.productId) ?? 0) + item.quantity,
    );
  }

  return quantitiesByProductId;
}
