import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { USER_ROLE } from './entities/user.entity';
import { SafeUser, UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(USER_ROLE.ADMIN, USER_ROLE.ASSISTANT)
  findMany(): Promise<SafeUser[]> {
    return this.usersService.findMany();
  }

  @Post()
  @Roles(USER_ROLE.ADMIN)
  createOne(@Body() payload: CreateUserDto): Promise<SafeUser> {
    return this.usersService.createOne(payload);
  }

  @Patch(':id')
  @Roles(USER_ROLE.ADMIN, USER_ROLE.ASSISTANT)
  updateOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateUserDto,
  ): Promise<SafeUser> {
    return this.usersService.updateOne(id, payload);
  }
}
