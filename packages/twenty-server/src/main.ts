import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import fs from 'fs';

import bytes from 'bytes';
import { useContainer, ValidationError } from 'class-validator';
import session from 'express-session';
import { graphqlUploadExpress } from 'graphql-upload';

import { NodeEnvironment } from 'src/engine/core-modules/environment/interfaces/node-environment.interface';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { LoggerService } from 'src/engine/core-modules/logger/logger.service';
import { getSessionStorageOptions } from 'src/engine/core-modules/session-storage/session-storage.module-factory';
import { UnhandledExceptionFilter } from 'src/filters/unhandled-exception.filter';

import { AppModule } from './app.module';
import './instrument';

import { settings } from './engine/constants/settings';
import { generateFrontConfig } from './utils/generate-front-config';

const bootstrap = async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: false,
    bufferLogs: process.env.LOGGER_IS_BUFFER_ENABLED === 'true',
    rawBody: true,
    snapshot: process.env.NODE_ENV === NodeEnvironment.development,
    ...(process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH
      ? {
          httpsOptions: {
            key: fs.readFileSync(process.env.SSL_KEY_PATH),
            cert: fs.readFileSync(process.env.SSL_CERT_PATH),
          },
        }
      : {}),
  });
  const logger = app.get(LoggerService);
  const environmentService = app.get(EnvironmentService);
  const nodeEnv = environmentService.get('NODE_ENV');
  const isDevEnvironment =
    nodeEnv === NodeEnvironment.development || nodeEnv === NodeEnvironment.test;

  // CORS configuration
  const frontendUrl = environmentService.get('FRONTEND_URL');
  const corsAllowedOrigins =
    process.env.CORS_ALLOWED_ORIGINS?.split(',').filter(Boolean) || [];

  // Always include the frontend URL if it exists
  if (frontendUrl && !corsAllowedOrigins.includes(frontendUrl)) {
    corsAllowedOrigins.push(frontendUrl);
  }

  // In production, ensure the main app domain is allowed
  if (
    !isDevEnvironment &&
    !corsAllowedOrigins.includes('https://app.nestermind.com')
  ) {
    corsAllowedOrigins.push('https://app.nestermind.com');
  }

  // Special handling for development environment
  const corsOptions = {
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'x-locale',
      'x-schema-version',
    ],
    exposedHeaders: ['Content-Disposition'],
  };

  if (isDevEnvironment) {
    // In development, we can be more permissive with CORS
    // This allows local development on different ports
    logger.log(
      'Running in development mode - using permissive CORS for localhost',
      'CorsConfig',
    );

    // Function to check if origin is localhost
    const isLocalhost = (origin: string) => {
      if (!origin) return false;

      try {
        const url = new URL(origin);

        logger.log(
          `Checking origin: ${origin}, hostname: ${url.hostname}`,
          'CorsConfig',
        );

        // Check for exact localhost or 127.0.0.1
        if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
          logger.log('Matched exact localhost or 127.0.0.1', 'CorsConfig');

          return true;
        }
        // Check for subdomains of localhost
        if (url.hostname.endsWith('.localhost')) {
          logger.log('Matched localhost subdomain', 'CorsConfig');

          return true;
        }
        logger.log('Did not match any localhost patterns', 'CorsConfig');

        return false;
      } catch (error) {
        logger.error(`Error parsing origin: ${error.message}`, 'CorsConfig');

        return false;
      }
    };

    // Use a function for origin to dynamically check localhost origins
    app.enableCors({
      ...corsOptions,
      origin: (origin, callback) => {
        logger.log(
          `Received CORS request from origin: ${origin}`,
          'CorsConfig',
        );

        // Allow if origin is null (like same-origin requests)
        if (!origin) {
          logger.log('Allowing null origin', 'CorsConfig');

          return callback(null, true);
        }

        // Check if origin is in the allowed list
        if (corsAllowedOrigins.includes(origin)) {
          logger.log(
            `Origin found in explicit allow list: ${origin}`,
            'CorsConfig',
          );

          return callback(null, true);
        }

        // Check if origin is localhost in dev mode
        if (isLocalhost(origin)) {
          logger.log(`Allowing localhost origin: ${origin}`, 'CorsConfig');

          return callback(null, true);
        }

        logger.warn(`Rejecting origin: ${origin}`, 'CorsConfig');
        callback(new Error('Not allowed by CORS'));
      },
    });
  } else {
    // In production, use strict CORS with specific allowed origins
    logger.log(
      'Running in production mode - using strict CORS configuration',
      'CorsConfig',
    );
    app.enableCors({
      ...corsOptions,
      origin: corsAllowedOrigins.length ? corsAllowedOrigins : false,
    });
  }

  app.use(session(getSessionStorageOptions(environmentService)));

  // TODO: Double check this as it's not working for now, it's going to be helpful for durable trees in twenty "orm"
  // // Apply context id strategy for durable trees
  // ContextIdFactory.apply(new AggregateByWorkspaceContextIdStrategy());

  // Apply class-validator container so that we can use injection in validators
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Use our logger
  app.useLogger(logger);

  app.useGlobalFilters(new UnhandledExceptionFilter());

  // Apply validation pipes globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors) => {
        const error = new ValidationError();

        error.constraints = Object.assign(
          {},
          ...errors.map((error) => error.constraints),
        );

        return error;
      },
    }),
  );

  // Add global anti-clickjacking headers
  app.use((req, res, next) => {
    // Add security headers to all responses
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Only set CSP for HTML responses to avoid breaking API requests
    const path = req.path;

    if (path === '/' || path.endsWith('.html') || !path.includes('.')) {
      res.setHeader(
        'Content-Security-Policy',
        "frame-ancestors 'self'; default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval';",
      );
    }

    next();
  });

  app.useBodyParser('json', { limit: settings.storage.maxFileSize });
  app.useBodyParser('urlencoded', {
    limit: settings.storage.maxFileSize,
    extended: true,
  });

  // Graphql file upload
  app.use(
    graphqlUploadExpress({
      maxFieldSize: bytes(settings.storage.maxFileSize),
      maxFiles: 10,
    }),
  );

  // Inject the server url in the frontend page
  generateFrontConfig();

  await app.listen(environmentService.get('NODE_PORT'));
};

bootstrap();
