import { Injectable, ForbiddenException, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class SuperadminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    if (req.user?.role !== 'superadmin') {
      throw new ForbiddenException('Superadmin access required');
    }
    return true;
  }
}
