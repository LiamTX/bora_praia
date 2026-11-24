import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { LogLevel, Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ErrorFilter } from './error.filter';
import { DatabaseFilter } from './_shared/exception-filter/database.filter';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

async function bootstrap() {
    const logger: LogLevel[] = IS_PRODUCTION
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'log', 'debug', 'verbose'];
    const app = await NestFactory.create(AppModule, { logger });

    app.enableCors();

    app.setGlobalPrefix('api/v1');

    app.useGlobalFilters(new DatabaseFilter(), new ErrorFilter());
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

    const config = new DocumentBuilder()
        .setTitle('Bora Praia API')
        .setDescription('Bora Praia API documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config, { deepScanRoutes: true });
    SwaggerModule.setup('doc', app, document);

    await app.listen(process.env.PORT || 3000);
    Logger.log(`Application is running on: ${await app.getUrl()}`, 'Bootstrap');
}

bootstrap();
