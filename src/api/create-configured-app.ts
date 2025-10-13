import type { AppConfig } from "@configuration/app-config";
import { buildContainer } from "@api/container";
import { registerCommonRoutes } from "@api/routes/common";
import { registerGeniallyRoutes } from "@api/routes/genially";
import { createExpressApp } from "@api/app-factory";

export async function createConfiguredApp(config?: AppConfig) {
  const app = createExpressApp();

  // Routes that do not need DI/DB
  registerCommonRoutes(app);

  const {container, dispose} = await buildContainer(config);
  registerGeniallyRoutes(app, container);

  return {app, close: dispose};
}
