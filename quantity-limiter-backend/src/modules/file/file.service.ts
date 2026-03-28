import { Injectable } from '@nestjs/common';
import * as tmp from 'tmp';
tmp.setGracefulCleanup();

@Injectable()
export class FileService {
  constructor() {}
}
