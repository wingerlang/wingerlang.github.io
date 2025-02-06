// server.ts
import { Handler } from "./routes/pagehandler.ts";

const routes: Record<string, string> = {
  'notFound': '404',
  '/': 'index'
}

const handler = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const path: string = url.pathname;

  console.log(`Request received for: ${path}`);

  if (routes[path]) {
    return Handler(routes[path]);
  }

  else if (path.startsWith("/public/")) {
      try {
          const file = await Deno.readFile("." + path);
          const contentType = getContentType(path); 
          return new Response(file, { headers: { "Content-Type": contentType } });
      } catch {
          return Handler(routes.notFound);
      }
  } else {
    return Handler(routes.notFound);
  }
};

function getContentType(path: string): string {
    if (path.endsWith(".css")) return "text/css";
    if (path.endsWith(".js")) return "text/javascript";
    if (path.endsWith(".png")) return "image/png";
    if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
    if (path.endsWith(".gif")) return "image/gif";
    if (path.endsWith(".svg")) return "image/svg+xml";
    return "text/html; charset=utf-8"; // Default
}

Deno.serve(handler);