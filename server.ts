import { defaultWingerConfig, WingerConfig } from "./config.ts";
import { renderPage } from "./utils/template.ts";
import {
  ContentType,
  getFileExtension,
  mapContentType,
} from "./utils/utils.ts";

interface Nav {
  path?: string;
  title?: string;
  nav?: boolean;
}

type WingerRoutes = Record<string, Nav>;

const routes: WingerRoutes = {
  "notFound": { path: "404", nav: false },
  "/": { title: "home", path: "index" },
  "/cv": { title: "CV" },
  "/path-to-ai": { title: "Path to AI " },
};

const api: Record<string, any> = {
  "source": getSourceCode,
  "nav": getNavFromRoutes,
};

const handleAPI = async (path: string): Promise<Response> => {
  if (api[path] && typeof api[path] == "function") {
    let responseData = await api[path]();

    if (typeof responseData === "object" && responseData !== null) {
      responseData = JSON.stringify(responseData);
    } else if (responseData === undefined || responseData === null) {
      responseData = JSON.stringify({
        message: "No data returned from API function",
      });
    } else if (typeof responseData !== "string") {
      responseData = String(responseData);
    }
    return new Response(responseData, {
      headers: { "Content-Type": "application/json" },
    });
  } else {
    return new Response("API not found", { status: 404 });
  }
};

function getContentType(path: string): string {
  return mapContentType(getFileExtension(path)) ||
    mapContentType(ContentType.html) || "";
}

async function getSourceCode() {
  return await Deno.readTextFile("server.ts");
}

function getNavFromRoutes() {
  const navs = Object.keys(routes)
    .map((k) => ({ path: k, title: routes[k].title }))
    .filter((r) => routes[r.path].nav !== false);
  return navs;
}

class WingerApp {
  appConfig: WingerConfig;
  routes: WingerRoutes;

  constructor() {
    this.routes = {};
    this.appConfig = defaultWingerConfig;
  }

  setRoutes(routes: WingerRoutes) {
    this.routes = routes;
    return this;
  }

  async routeHandler(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path: string = url.pathname;

    if (routes[path]) {
      return this.Handler(routes[path].path || path);
    } else if (path.startsWith("/api")) {
      return handleAPI(path.replace("/api/", ""));
    } else if (path.startsWith("/public/")) {
      try {
        const file = await Deno.readFile("." + path);
        return new Response(file, {
          headers: { "Content-Type": getContentType(path) },
        });
      } catch {
        return this.Handler(routes.notFound.path || "404");
      }
    } else {
      return this.Handler(routes.notFound.path || "404");
    }
  }

  async Handler(name: string): Promise<Response> {
    let data = {};
    try {
      const controllerModule = await import(this.controllerPath(name));
      if (controllerModule && controllerModule.data) {
        data = controllerModule.data;
      }
    } catch (error) {
      console.warn(
        `Controller file for page "${name}" not found or error loading:`,
        error,
      );
      name = "404";
    }
    return renderPage(this.viewPath(name), name, data);
  }

  viewPath(name: string): string {
    return `./pages/${name}/${this.appConfig.VIEW_NAME}.html`;
  }
  controllerPath(name: string): string {
    return `./pages/${name}/${this.appConfig.CONTROLLER_NAME}.ts`;
  }

  start() {
    console.log("available routes", this.routes);
    Deno.serve(this.routeHandler.bind(this));
  }
}

const WingerServer = new WingerApp();

WingerServer
  .setRoutes(routes)
  .start();
