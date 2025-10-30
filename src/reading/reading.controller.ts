import { Controller, Patch, Body, Get, Param, ParseUUIDPipe, UseGuards, Query } from '@nestjs/common';
import { ReadingService } from './reading.service';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { OwnerOrAdminGuard } from '../common/guards/owner-or-admin.guard';
import { CurrentUser, TokenUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { FindShelfDto } from './dto/find-shelf.dto';

@Controller('reading')
export class ReadingController {
  constructor(private readonly readingService: ReadingService) {}

  @Patch('progress')
  @UseGuards(JwtAuthGuard, OwnerOrAdminGuard)
  // Update reading progress for a user and book (auth required)
  updateProgress(@CurrentUser() user: TokenUser, @Body() updateProgressDto: UpdateProgressDto) {
    // For non-admins, force userId to the token's subject.
    // Admins may update any user's progress (userId comes from body).
    if (user.role !== 'admin') {
      updateProgressDto.userId = user.userId;
    }
    const data = this.readingService.updateProgress(updateProgressDto);
    return { success: true, data };
  }
  @Get('progress/:bookId')
  // Get reading progress for a specific book across all users
  getProgress(@Param('bookId', ParseUUIDPipe) bookId: string) {
    const data = this.readingService.getProgressByBook(bookId);
    return { success: true, data };
  }

  @Get('shelf')
  @UseGuards(JwtAuthGuard)
  // Get the authenticated user's shelf with optional filters/sorting
  getShelf(@CurrentUser() user: TokenUser, @Query() query: FindShelfDto) {
    const data = this.readingService.getShelf(user.userId, query);
    return { success: true, data };
  }
}
