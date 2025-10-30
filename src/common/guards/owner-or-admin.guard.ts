import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class OwnerOrAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest() as any;
    const user = req.user as { userId: string; role: 'user' | 'admin' } | undefined;
    if (!user) return false; // Global JWT guard should set this

    if (user.role === 'admin') return true;

    const bodyUserId = req.body?.userId as string;
    if (user.userId !== bodyUserId) {
      throw new ForbiddenException('You can only modify your own progress');
    }
    return true;
  }
}
