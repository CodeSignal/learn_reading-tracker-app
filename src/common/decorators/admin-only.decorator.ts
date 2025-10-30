import { applyDecorators, UseGuards } from '@nestjs/common';
import { Roles } from './roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

export function AdminOnly() {
  return applyDecorators(UseGuards(JwtAuthGuard, RolesGuard), Roles('admin'));
}

