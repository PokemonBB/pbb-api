import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { RequestWithUser } from '../interfaces/request-with-user.interface';

@Injectable()
export class ActiveUserGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      return true;
    }

    if (!user.active) {
      throw new ForbiddenException(
        'Account is not activated. Please check your email and activate your account.',
      );
    }

    return true;
  }
}
