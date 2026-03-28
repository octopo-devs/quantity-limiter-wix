import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { HeaderStrategy } from './strategies/header.strategy';

@Module({
  imports: [PassportModule, JwtModule],
  providers: [AuthService, HeaderStrategy],
  exports: [AuthService],
})
export class AuthModule {}
