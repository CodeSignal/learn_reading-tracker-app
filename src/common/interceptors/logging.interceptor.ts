import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logs: LogsService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const http = ctx.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const method = (req as any).method;
    const url = (req as any).originalUrl || (req as any).url;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        this.logs.add({
          method,
          url,
          status: (res as any).statusCode,
          ms: Date.now() - start,
          at: new Date().toISOString(),
        });
      }),
    );
  }
}

