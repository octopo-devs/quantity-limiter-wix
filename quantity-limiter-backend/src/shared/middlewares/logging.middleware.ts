import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > 500 || res.statusCode > 304) {
        console.log(`Duration: ${duration}ms - Status: ${res.statusCode} - Request: ${req.method} ${req.originalUrl}`);
      }
      if (duration > 3000 || res.statusCode > 304) {
        const { body, method, originalUrl } = req || {};
        const { statusCode } = res || {};
        // this.telegramApiService.sendTelegramMessage({
        //   duration,
        //   statusCode,
        //   method: req.method,
        //   originalUrl: req.originalUrl,
        //   statusMessage,
        //   body,
        //   query,
        //   params,
        // });
        console.log(`Status: ${statusCode} - Request: ${method} ${originalUrl} - payload: ${JSON.stringify(body)}`);
      }
    });
    next();
  }
}
