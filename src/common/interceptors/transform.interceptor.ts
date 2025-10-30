import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Envelope<T> {
  data: T;
  meta?: { count?: number; timestamp?: string };
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Envelope<T>> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<Envelope<T>> {
    return next.handle().pipe(
      map((payload: any) => {
        const meta: Envelope<T>['meta'] = { timestamp: new Date().toISOString() };
        if (Array.isArray(payload)) meta.count = payload.length;
        return { data: payload, meta };
      }),
    );
  }
}

