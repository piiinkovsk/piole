import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to get the current user from JWT token
 * Usage: @CurrentUser() user: User
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
