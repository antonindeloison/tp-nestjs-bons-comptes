import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest } from '../authenticated-request.js';

// @CurrentUser()         → { userId }
// @CurrentUser('userId') → l'identifiant seul
export const CurrentUser = createParamDecorator(
  (field: keyof AuthenticatedRequest['user'] | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return field ? request.user[field] : request.user;
  },
);
