import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { AuthUser } from '../types/auth-user.type';

export const GqlCurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const gqlCtx = GqlExecutionContext.create(ctx);
    return gqlCtx.getContext<{ req: { user: AuthUser } }>().req.user;
  },
);
