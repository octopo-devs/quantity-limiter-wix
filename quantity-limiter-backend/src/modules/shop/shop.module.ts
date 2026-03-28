import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopGeneral } from './entities/shop-general.entity';
import { ShopInfo } from './entities/shop-info.entity';
import { ShopInstalled } from './entities/shop-installed.entity';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
@Module({
  imports: [TypeOrmModule.forFeature([ShopGeneral, ShopInfo, ShopInstalled])],
  controllers: [ShopController],
  providers: [ShopService],
  exports: [ShopService],
})
export class ShopModule {}
