import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { User } from "../entities/entitie.user";
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
