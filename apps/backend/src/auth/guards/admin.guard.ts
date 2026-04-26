import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { UserRole } from 'src/user/enums/user-role.enum';
import type { AuthUser } from 'src/auth/types/auth-user.type';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user: AuthUser }>();
    const user = await this.userService.findById(request.user.id);
    if (user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}
