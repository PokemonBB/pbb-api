import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: {
        level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
      },
    }),
  );

  app.setGlobalPrefix('api');

  // Register cookie parser for Fastify
  await app.register(fastifyCookie);

  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : [];

  // Register CORS for Fastify
  await app.register(fastifyCors, {
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  });

  const config = new DocumentBuilder()
    .setTitle('PokemonBattleBrawl API')
    .setDescription('API REST')
    .setVersion('1.0')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Admin', 'Admin management endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Friends', 'Friends management endpoints')
    .addTag('Invitations', 'Invitation management endpoints')
    .addTag('Activation', 'Activation management endpoints')
    .addTag('Email', 'Email management endpoints')
    .addTag('Health', 'Healthcheck endpoints')
    .addTag('Audit', 'Audit management endpoints')
    .addCookieAuth('token', {
      type: 'http',
      in: 'cookie',
      scheme: 'bearer',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  SwaggerModule.setup('docs', app, document);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000, process.env.HOST || '0.0.0.0');
}
bootstrap().catch((error) => {
  console.error('Error starting the application:', error);
  process.exit(1);
});
