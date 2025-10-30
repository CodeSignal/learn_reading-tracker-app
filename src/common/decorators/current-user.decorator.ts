import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface TokenUser {
  userId: string;
  role: 'user' | 'admin';
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TokenUser | undefined => {
    const req = ctx.switchToHttp().getRequest() as any;
    return req.user as TokenUser | undefined;
  },
);
