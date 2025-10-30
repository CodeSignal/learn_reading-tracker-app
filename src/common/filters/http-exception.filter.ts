import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const raw = exception.getResponse();
    const message = typeof raw === 'string' ? raw : (raw as any)?.message;

    res.status(status).json({
      error: {
        statusCode: status,
        message: Array.isArray(message) ? message.join(', ') : message,
        path: req.url,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

