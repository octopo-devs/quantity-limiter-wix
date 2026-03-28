import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class WebhookAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const dataDecoded = await this.authService.verifyWebhook(request);
    if (!dataDecoded) throw new UnauthorizedException();
    try {
      let parsed;
      try {
        parsed = JSON.parse(dataDecoded.data);
        if (parsed.data) {
          try {
            parsed.data = JSON.parse(parsed.data);
          } catch {
            // Keep original data if can't parse
            parsed.data = parsed.data;
          }
        }
      } catch {
        // Keep original data if can't parse
        parsed = dataDecoded.data;
      }
      request.body = parsed;
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException();
    }
    return dataDecoded;
  }
}
