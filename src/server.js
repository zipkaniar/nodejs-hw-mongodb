import express from 'express';
import cors from 'cors';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import contactsRouter from './routers/contacts.js';
import authRouter from './routers/auth.js';
import cookieParser from 'cookie-parser';

const logger = pino({ transport: { target: 'pino-pretty' } });

export function setupServer() {
  try {
    const app = express();
    const PORT = process.env.PORT || 3000;

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(pinoHttp({ logger }));

    app.use('/contacts', contactsRouter);
    app.use('/auth', authRouter);

    app.use(notFoundHandler);
    app.use(errorHandler);
    console.log(
      app._router.stack.map((layer) =>
        layer.route ? layer.route.path : layer.name,
      ),
    );

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Server failed to start: ${error.message}`);
    process.exit(1);
  }
}
