import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  register(@Body() body: { name: string; username: string; password: string }) {
    return this.authService.register(body.name, body.username, body.password);
  }

  @Post('login')
  @Public()
  login(@Body() body: { username: string; password: string }) {
    return this.authService.login(body.username, body.password);
  }
}

