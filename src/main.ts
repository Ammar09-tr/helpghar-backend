import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api/v1');

  // Serve uploaded files statically
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: false,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('HelpGhar API')
    .setDescription('Production-Ready Home Services Platform — Pakistan')
    .setVersion('2.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication & registration')
    .addTag('Bookings', 'Service booking lifecycle (inDrive model)')
    .addTag('Technicians', 'Technician profiles & availability')
    .addTag('Chat', 'Real-time messaging')
    .addTag('Upload', 'File & image upload')
    .addTag('Admin', 'Admin control panel')
    .addTag('Commission', 'Platform commission management')
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 HelpGhar API running at: http://localhost:${port}/api/v1`);
  logger.log(`📚 Swagger Docs:             http://localhost:${port}/api/docs`);
  logger.log(`🗂️  Uploads served at:        http://localhost:${port}/uploads`);
}
bootstrap();
