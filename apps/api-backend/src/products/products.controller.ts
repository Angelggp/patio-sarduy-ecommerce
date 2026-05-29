import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { USER_ROLE } from '../users/entities/user.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { type ImportCsvResult, ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Public()
  findMany(@Query() query: QueryProductsDto): Promise<PaginatedResponseDto<Product>> {
    return this.productsService.findMany(query);
  }

  @Post()
  @Roles(USER_ROLE.ADMIN, USER_ROLE.ASSISTANT)
  createOne(@Body() payload: CreateProductDto): Promise<Product> {
    return this.productsService.createOne(payload);
  }

  @Patch(':id')
  @Roles(USER_ROLE.ADMIN, USER_ROLE.ASSISTANT)
  updateOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.updateOne(id, payload);
  }

  @Delete(':id')
  @Roles(USER_ROLE.ADMIN, USER_ROLE.ASSISTANT)
  deleteOne(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.productsService.deleteOne(id);
  }

  @Post('import-csv')
  @Roles(USER_ROLE.ADMIN, USER_ROLE.ASSISTANT)
  @UseInterceptors(FileInterceptor('file'))
  importCsv(
    @UploadedFile() file: { buffer: Buffer; originalname: string },
  ): Promise<ImportCsvResult> {
    return this.productsService.importCsv(file.buffer);
  }
}
