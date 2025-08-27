import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { verifyJwt } from '../../auth/jwt.util';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req = context.switchToHttp().getRequest() as any;
    const auth = req.headers['authorization'] as string | undefined;
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing token');
    }
    const token = auth.substring('Bearer '.length);
    const payload = verifyJwt(token);
    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }
    req.user = { userId: payload.sub, role: payload.role };
    return true;
  }
}

