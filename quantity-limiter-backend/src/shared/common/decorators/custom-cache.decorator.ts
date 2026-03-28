import { CacheInterceptor } from '@nestjs/cache-manager';
import { Injectable, ExecutionContext } from '@nestjs/common';

@Injectable()
export class CustomCacheInterceptor extends CacheInterceptor {
  private readonly serviceIdentifier = 'avada-order-limiter';

  trackBy(context: ExecutionContext): string | undefined {
    const key = super.trackBy(context);
    return key ? `${this.serviceIdentifier}:${key}` : undefined;
  }
}
