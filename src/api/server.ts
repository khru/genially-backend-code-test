import errorHandler from "errorhandler";
import { createConfiguredApp } from "@api/create-configured-app";

(async () => {
  try {
    const { app, close } = await createConfiguredApp();

    app.use(errorHandler());

    const server = app.listen(app.get("port"), () => {
      console.log("  App is running at http://localhost:%d in %s mode", app.get("port"), app.get("env"));
      console.log("  Press CTRL-C to stop\n");
    });

    const shutdown = async () => {
      try {
        await close();
      } catch (error) {
        console.error("Error during app shutdown:", error);
      } finally {
        server.close(() => process.exit(0));
      }
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
    process.on("unhandledRejection", (err) => {
      console.error("unhandledRejection:", err);
      shutdown();
    });
  } catch (err) {
    console.error("Fatal startup error:", err);
    process.exit(1);
  }
})();
