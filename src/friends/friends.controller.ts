import { Controller, Post, Body, Get, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import { HandleRequestDto } from './dto/handle-request.dto';
import { CurrentUser, type TokenUser } from '../common/decorators/current-user.decorator';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friends: FriendsService) {}

  @Post('request')
  requestFriend(@CurrentUser() user: TokenUser, @Body() dto: CreateFriendRequestDto) {
    return this.friends.requestFriend(user.userId, dto.recipientId);
  }

  @Get('requests')
  getIncoming(@CurrentUser() user: TokenUser) {
    return this.friends.getIncomingRequests(user.userId);
  }

  @Patch('requests/:requestId')
  handle(
    @CurrentUser() user: TokenUser,
    @Param('requestId', ParseIntPipe) requestId: number,
    @Body() dto: HandleRequestDto,
  ) {
    return this.friends.handleRequest(user.userId, requestId, dto.status);
  }

  @Get(':friendId/progress')
  getFriendProgress(@CurrentUser() user: TokenUser, @Param('friendId', ParseIntPipe) friendId: number) {
    return this.friends.getFriendProgress(user.userId, friendId);
  }
}
