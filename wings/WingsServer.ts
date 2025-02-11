import * as path from "jsr:@std/path";
import { pathToFileURL } from "node:url"; // Importera pathToFileURL

import { defaultWingerConfig, WingerConfig } from "../config.ts";
import { Controller, RouteInfo, WingerRoutes } from "./models.ts";
import { renderPage } from "./utils/template.ts";
import {
  ContentType,
  getFileExtension,
  getJsonHeaders,
  isFunction,
  isObject,
  isString,
  isUndefinedOrNull,
  mapContentType,
} from "./utils/utils.ts";

const PUBLIC_PATH = "/public/";
const API_PATH = '/api';
const PAGE_404 = '/404';

function getContentType(path: string): string {
  return mapContentType(getFileExtension(path)) ||
    mapContentType(ContentType.html) || "";
}

export class WingerApp {
  api: any;
  appConfig: WingerConfig;
  routesPath: string;
  pagesPath: string = '';
  routes: Record<string, any> = {path: ''};

  constructor() {
    this.routesPath = '';
    this.appConfig = defaultWingerConfig;
  }

  setApi(api: Record<string, any>) {
    this.api = api;
    return this;
  }

getPagesPath() {
  return path.join(Deno.cwd(), this.pagesPath);
}

async addPages(pagePath: string) {
  this.routes = {};
  this.pagesPath = pagePath;
  const routesPath = this.getPagesPath();

  try {
    const folder = Deno.readDirSync(routesPath);

    for (const dirEntry of folder) {
      if (dirEntry.isDirectory) {
        const routeName = dirEntry.name;
        const controllerPath = path.join(routesPath, routeName, 'controller.ts');
        let routeInfo: RouteInfo = { path: routeName, navbar: true };

        try {
          // Konvertera controllerPath till en fil-URL
          const controllerPathURL = pathToFileURL(controllerPath).href;

          // Dynamiskt importera controller.ts med fil-URL
          const controllerModule = await import(controllerPathURL);
          const controller: Controller = controllerModule.controller;

          if (controller && controller.meta) {
            routeInfo.controller = controller;
            routeInfo.navbar = controller.meta.navbar === true;
          }
        } catch (error) {
          console.warn(`Controller.ts kunde inte läsas in för route: ${routeName}. Fel:`, error);
        }
        this.routes['/' + routeName] = routeInfo;
      }
    }
  } catch (error) {
    console.error("Fel vid inläsning av routes-katalog:", error);
  }
  return this
}

  async handleRoutes(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path: string = url.pathname;

    console.log(`Request for path: ${path}`);
    if ('/api/routes' === path) {
      return new Response(JSON.stringify(this.routes), { headers: getJsonHeaders() });
    } else if (this.routes[path]) {
      return this.handlePages(this.routes[path].path);
    } else if (path.startsWith(API_PATH)) {
      return this.handleAPI(path.replace(API_PATH, ''));
    } else if (path.startsWith(PUBLIC_PATH)) {
      try {
        const file = await Deno.readFile('.' + path);
        return new Response(file, {
          headers: { "Content-Type": getContentType(path) },
        });
      } catch {
        return this.handlePages(PAGE_404);
      }
    } else {
      return this.handlePages(PAGE_404);
    }
  }

  async handlePages(name: string): Promise<Response> {
    let controller: Controller = {meta: {}, data: {}};
    
    try {
      const path = pathToFileURL(this.controllerPath(name)).href;
      const controllerModule = await import(path);
      if (controllerModule && controllerModule.controller) {
        controller = controllerModule.controller;
      }
    } catch (error) {
      console.warn( `Controller file for page "${name}" not found or error loading:`, error );
      if (controller.meta) {
        controller.meta.title = PAGE_404;
      }
    }
    return renderPage(this.viewPath(name), controller);
  }

  viewPath(name: string): string {
    return `${this.getPagesPath()}/${name}/${this.appConfig.VIEW_NAME}.html`;
  }

  controllerPath(name: string): string {
    return `${this.getPagesPath()}/${name}/${this.appConfig.CONTROLLER_NAME}.ts`;
  }

  async handleAPI(path: string): Promise<Response> {
  if (isFunction(this.api[path])) {
    let responseData = await this.api[path]();

    if (isObject(responseData)) {
      responseData = JSON.stringify(responseData);
    } else if (isUndefinedOrNull(responseData)) {
      responseData = JSON.stringify({
        message: "No data returned from API function",
      });
    } else if (!isString(responseData)) {
      responseData = String(responseData);
    }
    return new Response(responseData, { headers: getJsonHeaders() });
  } else {
    return new Response("API not found", { status: 404 });
  }
}
  start() {
    Deno.serve(this.handleRoutes.bind(this));
  }
}
