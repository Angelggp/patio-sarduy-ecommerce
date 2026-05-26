import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { ORDER_TYPE } from '../entities/order.entity';

function HasUserIdOrPersonalData(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'hasUserIdOrPersonalData',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(_value: unknown, args: ValidationArguments) {
          const payload = args.object as CreateOrderDto;
          if (payload.userId && Number.isInteger(payload.userId)) {
            return true;
          }

          return Boolean(payload.customerName?.trim() && payload.customerPhone?.trim());
        },
      },
    });
  };
}

class CreateOrderItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId?: number;

  @IsEnum(ORDER_TYPE)
  type: ORDER_TYPE;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  customerName: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  customerPhone: string;

  @HasUserIdOrPersonalData({
    message: 'Debe enviar userId o customerName y customerPhone cuando no hay usuario autenticado.',
  })
  readonly userIdentityCheck?: boolean;

  @ValidateIf((object: CreateOrderDto) => object.type === ORDER_TYPE.DELIVERY)
  @IsString()
  @MaxLength(120)
  address?: string;

  @ValidateIf((object: CreateOrderDto) => object.type === ORDER_TYPE.DELIVERY)
  @IsString()
  @MaxLength(80)
  zone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  instructions?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
