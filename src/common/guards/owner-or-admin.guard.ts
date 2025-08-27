import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class OwnerOrAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest() as any;
    const user = req.user as { userId: number; role: 'user' | 'admin' } | undefined;
    if (!user) return false;
    if (user.role === 'admin') return true;
    const bodyUserId = Number(req.body?.userId);
    if (user.userId !== bodyUserId) {
      throw new ForbiddenException('You can only modify your own progress');
    }
    return true;
  }
}

