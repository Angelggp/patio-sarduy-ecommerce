import { Body, Controller, Get, Headers, Param, ParseIntPipe, Patch, Post, Query, Req } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { USER_ROLE } from '../users/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  @Public()
  async createOne(
    @Body() payload: CreateOrderDto,
    @Headers('authorization') authorization?: string,
  ): Promise<Order> {
    const userIdFromJwt = await this.tryResolveUserIdFromAuthorizationHeader(authorization);
    return this.ordersService.createOne(payload, userIdFromJwt);
  }

  @Get()
  @Roles(USER_ROLE.ADMIN, USER_ROLE.ASSISTANT, USER_ROLE.STUDENT, USER_ROLE.CLIENT)
  findMany(
    @Query() query: QueryOrdersDto,
    @Req() request: { user: { sub: number; role: USER_ROLE } },
  ): Promise<PaginatedResponseDto<Order>> {
    return this.ordersService.findMany(query, request.user);
  }

  @Patch(':id/advance')
  @Roles(USER_ROLE.ADMIN, USER_ROLE.ASSISTANT)
  advanceToNextStatus(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.ordersService.advanceToNextStatus(id);
  }

  @Patch(':id/cancel')
  @Roles(USER_ROLE.ADMIN, USER_ROLE.ASSISTANT, USER_ROLE.CLIENT)
  cancelOrder(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: { user: { sub: number; role: USER_ROLE } },
  ): Promise<Order> {
    return this.ordersService.cancelOrder(id, request.user);
  }

  private async tryResolveUserIdFromAuthorizationHeader(
    authorization?: string,
  ): Promise<number | undefined> {
    if (!authorization?.startsWith('Bearer ')) {
      return undefined;
    }

    const token = authorization.slice('Bearer '.length).trim();
    if (!token) {
      return undefined;
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sub?: number }>(token, {
        secret: process.env.JWT_ACCESS_SECRET ?? 'jwt-access-dev-secret',
      });

      return payload.sub;
    } catch {
      return undefined;
    }
  }
}
