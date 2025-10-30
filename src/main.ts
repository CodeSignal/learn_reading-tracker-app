import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LogsService } from './common/logs/logs.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Enable CORS for all origins to allow frontend communication and enable validation
  app.enableCors({ origin: '*', credentials: true });
  // Enable global validation pipe for DTO validation
  app.useGlobalPipes(new ValidationPipe({ transform: true, transformOptions: { enableImplicitConversion: true } }));
  // Global interceptors and filters
  const logs = app.get(LogsService);
  app.useGlobalInterceptors(new LoggingInterceptor(logs), new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  // Serve static UI from public folder
  const publicDir = join(__dirname, '..', 'public');
  app.useStaticAssets(publicDir);
  const server = app.getHttpAdapter().getInstance();
  // SPA fallback: exclude API routes and module endpoints
  // Exclude API routes from SPA fallback, including newly added 'friends'
  server.get(/^(?!\/(?:api|users|books|reading|auth|admin|friends)).*/, (req: Request, res: Response) =>
    res.sendFile(join(publicDir, 'index.html')),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
