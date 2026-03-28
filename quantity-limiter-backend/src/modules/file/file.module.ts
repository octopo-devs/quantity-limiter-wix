import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { AttributesModule } from '../attributes/attributes.module';
import { ShopModule } from '../shop/shop.module';

@Module({
  imports: [AttributesModule, ShopModule],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
