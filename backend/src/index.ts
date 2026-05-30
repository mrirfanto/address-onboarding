import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import type { CountryCode } from './types/domain.js';

type ApiErrorResponse = {
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
};

type CountryOption = {
  code: CountryCode;
  name: string;
};

export const countries: CountryOption[] = [
  { code: 'USA', name: 'United States' },
  { code: 'AUS', name: 'Australia' },
  { code: 'IDN', name: 'Indonesia' },
];

export function createApp() {
  const app = express();
  const api = express.Router();

  app.use(cors());
  app.use(express.json());

  api.get('/health', healthHandler);
  api.get('/countries', countriesHandler);

  api.get('/__error', errorRouteHandler);

  api.use(notFoundHandler);

  app.use('/api', api);

  app.use(errorHandler);

  return app;
}

export function healthHandler(_req: Request, res: Response) {
  res.status(200).json({ status: 'ok' });
}

export function countriesHandler(_req: Request, res: Response) {
  res.status(200).json(countries);
}

export function errorRouteHandler() {
  throw new Error('forced test error');
}

export function notFoundHandler(_req: Request, res: Response) {
  const payload: ApiErrorResponse = {
    code: 'NOT_FOUND',
    message: 'Route not found',
  };

  res.status(404).json(payload);
}

export function errorHandler(_err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const payload: ApiErrorResponse = {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Something went wrong',
  };

  res.status(500).json(payload);
}

export const app = createApp();

const port = 3001;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });
}
