import { Controller, Get, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { LogsService } from '../common/logs/logs.service';
import { AdminOnly } from '../common/decorators/admin-only.decorator';

@Controller('admin')
export class AdminController {
  constructor(private readonly logs: LogsService) {}

  @Get('logs')
  @AdminOnly()
  getLogs(@Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number) {
    const data = this.logs.list(limit);
    return { success: true, data };
  }
}
