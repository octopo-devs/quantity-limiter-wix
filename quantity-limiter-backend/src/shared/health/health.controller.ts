import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get('live') // Endpoint cho Liveness Probe
  @HealthCheck()
  checkLiveness() {
    // Một kiểm tra đơn giản, chỉ cần ứng dụng còn chạy là được
    return this.health.check([]);
  }

  @Get('ready')
  @HealthCheck()
  check() {
    return this.health.check([() => this.db.pingCheck('typeorm')]);
  }
}
