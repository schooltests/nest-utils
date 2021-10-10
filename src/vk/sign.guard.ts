import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { isSignValid } from './operations';

@Injectable()
export class SignGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const signed = isSignValid(request.query, this.config.get<string>('integration.vkSecretKey', ''));

    return this.config.get<boolean>('core.devMode') || signed;
  }
}
