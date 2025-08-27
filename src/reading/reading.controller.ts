import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { ReadingService } from './reading.service';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { FindShelfDto } from './dto/find-shelf.dto';
import { OwnerOrAdminGuard } from '../common/guards/owner-or-admin.guard';
import { CurrentUser, type TokenUser } from '../common/decorators/current-user.decorator';

@Controller('reading')
export class ReadingController {
  constructor(private readonly reading: ReadingService) {}

  @Patch('progress')
  @UseGuards(OwnerOrAdminGuard)
  update(@Body() dto: UpdateProgressDto) {
    return this.reading.updateProgress(dto);
  }

  @Get('shelf')
  shelf(@CurrentUser() user: TokenUser, @Query() query: FindShelfDto) {
    return this.reading.findShelf(user.userId, query);
  }
}
