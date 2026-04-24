"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const path_1 = require("path");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api/v1');
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), { prefix: '/uploads' });
    app.enableCors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        credentials: false,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const config = new swagger_1.DocumentBuilder()
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
    swagger_1.SwaggerModule.setup('api/docs', app, swagger_1.SwaggerModule.createDocument(app, config));
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    logger.log(`🚀 HelpGhar API running at: http://localhost:${port}/api/v1`);
    logger.log(`📚 Swagger Docs:             http://localhost:${port}/api/docs`);
    logger.log(`🗂️  Uploads served at:        http://localhost:${port}/uploads`);
}
bootstrap();
//# sourceMappingURL=main.js.map