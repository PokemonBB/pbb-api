import { UserRole } from '../../enums/user-role.enum';

export class UserVisibilityHelper {
  static canSeeEmails(userRole: UserRole): boolean {
    return userRole === UserRole.ROOT || userRole === UserRole.ADMIN;
  }

  static canSeeTimestamps(userRole: UserRole): boolean {
    return userRole === UserRole.ROOT || userRole === UserRole.ADMIN;
  }

  static canSeeInternalFields(userRole: UserRole): boolean {
    return userRole === UserRole.ROOT || userRole === UserRole.ADMIN;
  }

  static isAdminRole(userRole: UserRole): boolean {
    return userRole === UserRole.ROOT || userRole === UserRole.ADMIN;
  }

  static isUserRole(userRole: UserRole): boolean {
    return userRole === UserRole.USER;
  }
}
