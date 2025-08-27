import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { LogsService } from '../logging/logs.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logs: LogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest() as any;
    const start = Date.now();
    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse() as any;
          this.logs.add({
            method: req.method,
            url: req.originalUrl || req.url,
            status: res.statusCode,
            ms: Date.now() - start,
            at: new Date().toISOString(),
          });
        },
        error: () => {
          const res = context.switchToHttp().getResponse() as any;
          this.logs.add({
            method: req.method,
            url: req.originalUrl || req.url,
            status: res.statusCode || 500,
            ms: Date.now() - start,
            at: new Date().toISOString(),
          });
        },
      }),
    );
  }
}
