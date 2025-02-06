const LAYOUT_PATH = "./views/layout.html";
const layoutTemplate = await Deno.readTextFile(LAYOUT_PATH);

// Hjälpfunktion för att rendera en sida med layout
async function renderPage(title: string, contentPagePath: string): Promise<string> {
  // Läs in innehållet för den specifika sidan
  const content = await Deno.readTextFile(contentPagePath);
  // Ersätt platshållare i layouten med faktiska värden
  return layoutTemplate
    .replace("{{title}}", title)
    .replace("{{content}}", content)
    .replace("{{year}}", new Date().getFullYear().toString());
}

// Starta HTTP-servern med Deno.serve
Deno.serve(async (req) => {
  const { pathname } = new URL(req.url);

  let html: string;

  switch (pathname) {
    case "/":
      html = await renderPage("Hem", "./views/index.html");
      break;
    case "/about":
      html = await renderPage("Om", "./views/about.html");
      break;
    default:
      // En enkel 404-sida
      return new Response("404 - Sidan hittades inte", { status: 404 });
  }

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
});
