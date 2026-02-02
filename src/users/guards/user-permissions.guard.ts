import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '../../enums/user-role.enum';
import type { RequestWithUser } from '../../auth/interfaces/request-with-user.interface';

@Injectable()
export class UserPermissionsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const currentUser = request.user;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const targetUserId = String((request.params as any).id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const body = request.body as any;

    if (!currentUser) {
      throw new ForbiddenException('User not authenticated');
    }

    if (String(currentUser._id) === targetUserId) {
      return true;
    }

    switch (currentUser.role) {
      case UserRole.ROOT:
        return true;

      case UserRole.ADMIN:
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (body && body.role) {
          throw new ForbiddenException(
            'Admins cannot change user roles. Only ROOT users can modify roles.',
          );
        }
        return true;

      case UserRole.USER:
        throw new ForbiddenException(
          'Users can only modify their own profile using dedicated endpoints',
        );

      default:
        throw new ForbiddenException('Invalid user role');
    }
  }
}
