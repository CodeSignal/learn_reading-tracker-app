import { Controller, Post, Body, Get, Patch, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import { HandleRequestDto } from './dto/handle-request.dto';
import { CurrentUser, TokenUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friends: FriendsService) {}

  @Post('request')
  @UseGuards(JwtAuthGuard)
  requestFriend(@CurrentUser() user: TokenUser, @Body() dto: CreateFriendRequestDto) {
    const data = this.friends.requestFriend(user.userId, dto.recipientId);
    return { success: true, data };
  }

  @Get('requests')
  @UseGuards(JwtAuthGuard)
  getIncoming(@CurrentUser() user: TokenUser) {
    const data = this.friends.getIncomingRequests(user.userId);
    return { success: true, data };
  }

  @Patch('requests/:requestId')
  @UseGuards(JwtAuthGuard)
  handle(
    @CurrentUser() user: TokenUser,
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @Body() dto: HandleRequestDto,
  ) {
    const data = this.friends.handleRequest(user.userId, requestId, dto.status);
    return { success: true, data };
  }

  @Get(':friendId/progress')
  @UseGuards(JwtAuthGuard)
  getFriendProgress(
    @CurrentUser() user: TokenUser,
    @Param('friendId', ParseUUIDPipe) friendId: string,
  ) {
    const data = this.friends.getFriendProgress(user.userId, friendId);
    return { success: true, data };
  }
}
