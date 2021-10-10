import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Observable } from 'rxjs';
import { isSignValid } from './operations';

type IntegrationConfig = () => {
  vkSecretKey: string;
};
type CoreConfig = () => {
  devMode: boolean;
};

@Injectable()
export class SignGuard implements CanActivate {
  constructor(
    @Inject('integration')
    private config: ConfigType<IntegrationConfig>,
    @Inject('core')
    private core: ConfigType<CoreConfig>,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const signed = isSignValid(request.query, this.config.vkSecretKey ?? '');

    return this.core.devMode || signed;
  }
}
