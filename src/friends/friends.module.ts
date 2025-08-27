import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { UsersModule } from '../users/users.module';
import { ReadingModule } from '../reading/reading.module';

@Module({
  imports: [UsersModule, ReadingModule],
  controllers: [FriendsController],
  providers: [FriendsService],
})
export class FriendsModule {}

