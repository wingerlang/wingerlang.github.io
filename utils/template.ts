import { extractValuesInTemplate } from "./utils.ts";

export async function renderTemplate( templatePath: string, data: Record<string, string | number> = {} ): Promise<string> {
  try {
    let templateContent = await Deno.readTextFile(templatePath);

    templateContent = extractValuesInTemplate(templateContent, data);
    return templateContent;
  } catch (e) {
    console.error(`Fel vid rendering av template ${templatePath}:`, e);
    return `<h1>Fel vid rendering av sida</h1><p>Kunde inte ladda mallen: ${templatePath}</p>`; // Enkel felhantering
  }
}

export async function renderPage( mainContentTemplatePath: string, pageTitle: string, data: Record<string, string | number> = {}): Promise<Response> {
  const currentYear = new Date().getFullYear();
  const headerContent = await renderTemplate("./templates/header.html");
  const footerContent = await renderTemplate("./templates/footer.html", { currentYear });

  console.log('data is', data);
  const mainContent = await renderTemplate(mainContentTemplatePath, data);
  const htmlContent = await renderTemplate("./templates/layout.html", {
    pageTitle,
    headerContent,
    mainContent,
    footerContent,
  });

  return new Response(htmlContent, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}