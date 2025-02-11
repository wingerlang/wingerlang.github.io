export interface WingerNav {
  path?: string;
  title?: string;
  nav?: boolean;
}

export interface Controller {
  meta?: {
    title?: string,
    navbar?: boolean,
  };
  data?: Record<string, any>;
}

export interface RouteInfo {
  path: string;
  navbar: boolean;
  controller?: Controller;
}

export type WingerRoutes = Record<string, WingerNav>;
