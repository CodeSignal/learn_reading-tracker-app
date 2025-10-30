import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { name: string; username: string; password: string }) {
    const data = await this.authService.register(body.name, body.username, body.password);
    return { success: true, data };
  }

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const data = await this.authService.login(body.username, body.password);
    return { success: true, data };
  }
}
