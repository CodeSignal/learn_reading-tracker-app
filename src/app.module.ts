import { Module, Global } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseService } from './database/database.service';
import { BooksModule } from './books/books.module';
import { ReadingModule } from './reading/reading.module';
import { AuthModule } from './auth/auth.module';
import { GlobalJwtAuthGuard } from './common/guards/global-jwt-auth.guard';
import { AdminController } from './admin/admin.controller';
import { LogsService } from './common/logs/logs.service';
import { RolesGuard } from './common/guards/roles.guard';
import { FriendsModule } from './friends/friends.module';

@Global()
@Module({
  imports: [UsersModule, BooksModule, ReadingModule, AuthModule, FriendsModule],
  controllers: [AppController, AdminController],
  providers: [
    AppService,
    DatabaseService,
    LogsService,
    RolesGuard,
    Reflector,
    { provide: APP_GUARD, useClass: GlobalJwtAuthGuard },
  ],
  exports: [DatabaseService],
})
export class AppModule {}
