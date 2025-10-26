import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '../../enums/user-role.enum';
import type { RequestWithUser } from '../../auth/interfaces/request-with-user.interface';

@Injectable()
export class InvitationPermissionsGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // ROOT and ADMIN can always create invitations
    if (user.role === UserRole.ROOT || user.role === UserRole.ADMIN) {
      return true;
    }

    // USER can create invitations only if they have canInvite permission
    if (user.role === UserRole.USER && user.canInvite) {
      return true;
    }

    throw new ForbiddenException(
      'You do not have permission to create invitations. Only ROOT, ADMIN users, or users with canInvite permission can create invitations.',
    );
  }
}
