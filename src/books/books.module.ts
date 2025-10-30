import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Module({
  controllers: [BooksController],
  providers: [BooksService, RolesGuard, JwtAuthGuard],
  exports: [BooksService],
})
export class BooksModule {}
