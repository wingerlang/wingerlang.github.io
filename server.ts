import { Handler } from "./routes/pagehandler.ts";
import { mapContentType, getFileExtension, ContentType } from "./utils/utils.ts";

interface Nav { 
  path?: string;
  title?: string;
  nav?: boolean;
}

const routes: Record<string, Nav> = {
  'notFound': {path: '404', nav: false},
  '/': {title: 'home', path: 'index'},
  '/cv': {title: 'CV'}
}

const api: Record<string, any> = {
    'source': getSourceCode,
    'nav': getNavFromRoutes,
  }

const handleAPI = async (path: string): Promise<Response> => {
  if (api[path] && typeof api[path] == 'function') {
    let responseData = await api[path]();

    if (typeof responseData === 'object' && responseData !== null) {
      responseData = JSON.stringify(responseData);
    } else if (responseData === undefined || responseData === null) {
      responseData = JSON.stringify({ message: "No data returned from API function" });
    } else if (typeof responseData !== 'string') {
      responseData = String(responseData);
    }
    return new Response(responseData, {headers: {"Content-Type": 'application/json'}});
  } else {
    return new Response('API not found', { status: 404 });
  }
}

const handler = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const path: string = url.pathname;

  if (routes[path]) {
    return Handler(routes[path].path || path);
  }
  else if (path.startsWith('/api')) {
    return handleAPI(path.replace('/api/', ''));
  }
  else if (path.startsWith("/public/")) {
      try {
          const file = await Deno.readFile("." + path);
          return new Response(file, { headers: { "Content-Type": getContentType(path) } });
      } catch {
          return Handler(routes.notFound.path || '404');
      }
  } else {
    return Handler(routes.notFound.path || '404');
  }
};

function getContentType(path: string): string {
    return mapContentType(getFileExtension(path)) || mapContentType(ContentType.html) || ''
}

async function getSourceCode() { 
  return await Deno.readTextFile('server.ts');
}

function getNavFromRoutes() {
  const navs = Object.keys(routes)
    .map(k => ({path: k, title: routes[k].title}))
    .filter(r => routes[r.path].nav !== false);
  console.log(navs);
  return navs;
}

console.log('available routes', routes);
Deno.serve(handler);