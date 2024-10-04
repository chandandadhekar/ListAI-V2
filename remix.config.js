if (
    process.env.HOST &&
    (!process.env.SHOPIFY_APP_URL ||
      process.env.SHOPIFY_APP_URL === process.env.HOST)
  ) {
    process.env.SHOPIFY_APP_URL = process.env.HOST;
    delete process.env.HOST;
  }
  
  /** @type {import('@remix-run/dev').AppConfig} */
  module.exports = {
    ignoredRouteFiles: ["**/.*"],
    appDirectory: "app",
    serverModuleFormat: "cjs",
    dev: { port: process.env.HMR_SERVER_PORT || 8002 },
    future: {},
    tailwind: true,
    postcss: true,
  };
  