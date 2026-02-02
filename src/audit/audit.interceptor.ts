import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { AuditService } from './audit.service';
import { UsersService } from '../users/users.service';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly usersService: UsersService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    const method = request.method;
    const url = request.url;
    const body = request.body;
    const params = request.params;

    if (!user) {
      return next.handle();
    }

    // Get previous data for UPDATE operations
    let oldData: Record<string, any> | null = null;
    if (method === 'PATCH' || method === 'PUT') {
      oldData = await this.getOldDataFromDatabase((params as any).id);
    }

    return next.handle().pipe(
      mergeMap(async (response) => {
        try {
          const action = this.getActionFromMethod(method);
          const resource = this.getResourceFromUrl(url);
          const resourceId = (params as any).id || 'unknown';

          const { oldValues, newValues } = this.getChangedValues(
            method,
            oldData,
            body,
          );

          // Only create log if there are actual changes
          if (oldValues || newValues) {
            await this.auditService.createAuditLog({
              userId: String(user._id || user.id || 'unknown'),
              username: user.username,
              action,
              resource,
              resourceId,
              oldValues,
              newValues,
            });
          }
        } catch (error) {
          console.error('Error creating audit log:', error);
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return response;
      }),
    );
  }

  private getActionFromMethod(method: string): string {
    switch (method) {
      case 'PATCH':
      case 'PUT':
        return 'UPDATE';
      case 'DELETE':
        return 'DELETE';
      case 'POST':
        return 'CREATE';
      case 'GET':
        return 'READ';
      default:
        return 'UNKNOWN';
    }
  }

  private getResourceFromUrl(url: string): string {
    if (url.includes('/admin/users')) {
      return 'user';
    }
    if (url.includes('/friends')) {
      return 'friendship';
    }
    if (url.includes('/auth')) {
      return 'auth';
    }
    return 'unknown';
  }

  private async getOldDataFromDatabase(
    userId: string,
  ): Promise<Record<string, any> | null> {
    try {
      const user = await this.usersService.findOne(userId);
      if (user) {
        return {
          username: user.username,
          email: user.email,
          role: user.role,
          active: user.active,
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting old data:', error);
      return null;
    }
  }

  private getChangedValues(
    method: string,
    oldData: Record<string, any> | null,
    body: any,
  ): { oldValues?: Record<string, any>; newValues?: Record<string, any> } {
    if (method === 'DELETE') {
      return {
        oldValues: oldData || undefined,
        newValues: { deleted: true },
      };
    }

    if (method === 'PATCH' || method === 'PUT') {
      if (!oldData || !body || typeof body !== 'object') {
        return { oldValues: undefined, newValues: undefined };
      }

      const oldValues: Record<string, any> = {};
      const newValues: Record<string, any> = {};

      // Compare each field from body with previous data
      Object.keys(body as Record<string, any>).forEach((key) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const newValue = (body as Record<string, any>)[key];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const oldValue = oldData[key];

        // Only record changes if values are different
        if (newValue !== oldValue) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          oldValues[key] = oldValue;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          newValues[key] = newValue;
        }
      });

      return {
        oldValues: Object.keys(oldValues).length > 0 ? oldValues : undefined,
        newValues: Object.keys(newValues).length > 0 ? newValues : undefined,
      };
    }

    return { oldValues: undefined, newValues: undefined };
  }
}
