import { WingerRoutes } from "./wings/models.ts";
import { WingerApp } from "./wings/WingsServer.ts";

async function getSourceCode() {
  return await Deno.readTextFile("server.ts");
}

function getNavFromRoutes() {
  const routes: WingerRoutes = {
  "/404": { },
  "/": {  },
  "/cv": {  },
  "/path-to-ai": {  },
};

  const navs = Object.keys(routes)
    .map((k) => ({ path: k, title: routes[k].title }))
    .filter((r) => routes[r.path].nav !== false);
  return navs;
}

const api: Record<string, any> = {
  "/source": getSourceCode,
  "/nav": getNavFromRoutes,
};

const server = new WingerApp();
await server.addPages('./pages/');

server.setApi(api);
server.start();