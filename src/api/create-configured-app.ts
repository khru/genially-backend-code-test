import bodyParser from 'body-parser';
import compression from 'compression';
import express from 'express';
import lusca from 'lusca';
import swaggerUi from 'swagger-ui-express';

import * as healthController from '@controllers/health';
import { openApiDocument } from '@api/docs/openapi';

import { AppConfig } from '@configuration/app-config';
import { AppConfigurator } from '@configuration/app-configurator';
import { configFromEnv } from '@configuration/config-from-env';
import { composeControllers } from '@configuration/compose';

export async function createConfiguredApp(config?: AppConfig) {
  const appConfig = config ?? configFromEnv();
  const configurator = new AppConfigurator(appConfig);
  await configurator.init();

  const repository = configurator.getGeniallyRepository();
  console.log('Repository:', repository.constructor.name);
  const { createGeniallyController, deleteGeniallyController, renameGeniallyController } =
    composeControllers(repository);

  const app = express();
  app.set('port', process.env.PORT || 3000);
  app.use(compression());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(lusca.xframe('SAMEORIGIN'));
  app.use(lusca.xssProtection(true));

  // routes
  app.get('/', healthController.check);
  app.post('/genially', createGeniallyController);
  app.delete('/genially/:id', deleteGeniallyController);
  app.patch('/genially/:id', renameGeniallyController);

  // docs
  app.get('/openapi.json', (_req, res) => res.json(openApiDocument));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

  return {
    app,
    close: () => configurator.close(),
  };
}
