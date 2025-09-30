import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    const app = await NestFactory.create(AppModule);

    // Enable CORS
    app.enableCors();

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Swagger API documentation setup
    const config = new DocumentBuilder()
      .setTitle('Makeup Wishlist API')
      .setDescription(
        'API for managing makeup wishlist items, collections, and products',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    // Prisma shutdown hooks
    try {
      const prismaService = app.get(PrismaService);
      await prismaService.enableShutdownHooks(app);
    } catch (error) {
      logger.warn('Failed to set up Prisma shutdown hooks', error);
    }

    // Handle shutdown signals
    const signals = ['SIGTERM', 'SIGINT'];
    for (const signal of signals) {
      process.on(signal, async () => {
        logger.log(`Received ${signal}, gracefully shutting down`);
        await app.close();
        process.exit(0);
      });
    }

    // Start the server
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(
      `Application is running in ${process.env.NODE_ENV || 'development'} mode`,
    );
    logger.log(`Server listening on: http://localhost:${port}`);
    logger.log(
      `API Documentation available at: http://localhost:${port}/api/docs`,
    );
  } catch (error) {
    logger.error('Failed to start application', error);
    process.exit(1);
  }
}

bootstrap();
