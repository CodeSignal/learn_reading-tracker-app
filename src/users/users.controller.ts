import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminOnly } from '../common/decorators/admin-only.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  // Return a list of all users
  findAll() {
    const data = this.usersService.findAll();
    return { success: true, data };
  }

  @Get(':id')
  // Retrieve a single user by ID
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = this.usersService.findOne(id);
    return { success: true, data };
  }

  @Post()
  // Create a new user
  create(@Body() createUserDto: CreateUserDto) {
    const data = this.usersService.create(createUserDto);
    return { success: true, data };
  }

  @Patch(':id')
  // Update an existing user
  @AdminOnly()
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    const data = this.usersService.update(id, updateUserDto);
    return { success: true, data };
  }

  @Delete(':id')
  // Remove a user
  @AdminOnly()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    const data = this.usersService.remove(id);
    return { success: true, data };
  }

  // NEW: list a user's friends
  @Get(':id/friends')
  @UseGuards(JwtAuthGuard)
  findFriends(@Param('id', ParseUUIDPipe) id: string) {
    const data = this.usersService.findFriends(id);
    return { success: true, data };
  }

  // NEW: user stats (auth required by default global guard)
  @Get(':id/stats')
  @UseGuards(JwtAuthGuard)
  getStats(@Param('id', ParseUUIDPipe) id: string) {
    const data = this.usersService.getStats(id);
    return { success: true, data };
  }
}
