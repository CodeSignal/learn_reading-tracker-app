import { Module } from '@nestjs/common';
import { ReadingService } from './reading.service';
import { ReadingController } from './reading.controller';
import { BooksModule } from '../books/books.module';
import { OwnerOrAdminGuard } from '../common/guards/owner-or-admin.guard';

@Module({
  imports: [BooksModule],
  controllers: [ReadingController],
  providers: [ReadingService, OwnerOrAdminGuard],
  exports: [ReadingService],
})
export class ReadingModule {}
