import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '../../enums/user-role.enum';
import type { RequestWithUser } from '../../auth/interfaces/request-with-user.interface';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const currentUser = request.user;

    if (!currentUser) {
      throw new ForbiddenException('User not authenticated');
    }

    if (
      currentUser.role === UserRole.ROOT ||
      currentUser.role === UserRole.ADMIN
    ) {
      return true;
    }

    throw new ForbiddenException(
      'Insufficient permissions. Only ROOT and ADMIN users can access this resource.',
    );
  }
}
