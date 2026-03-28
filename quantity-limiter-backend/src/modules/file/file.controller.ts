import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs';
import { FileService } from './file.service';

@Controller('file')
@ApiTags('File')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get('order-limiter-script-embed')
  async embedScript(@Res() res: Response) {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    fs.readFile('extensions/order-limiter/assets/order-limiter.min.js', { encoding: 'utf-8' }, (err, data) => {
      if (!err) {
        return res.send(data);
      }
      console.log(err);
    });
  }
}
