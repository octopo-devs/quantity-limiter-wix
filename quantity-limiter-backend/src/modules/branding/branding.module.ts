import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandingService } from './branding.service';
import { BrandingController } from './branding.controller';
import { Branding } from './entities/branding.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Branding])],
  providers: [BrandingService],
  controllers: [BrandingController],
})
export class BrandingModule {}
