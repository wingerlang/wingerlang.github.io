import { Controller } from "../models.ts";
import { extractValuesInTemplate, handleLoops } from "./utils.ts";

export async function renderTemplate(
  templatePath: string,
  controller: Controller): Promise<string> {
  try {
    let templateContent = await Deno.readTextFile(templatePath);
    templateContent = handleLoops(templateContent, controller.data);
    templateContent = extractValuesInTemplate(templateContent, controller.data);
    return templateContent;
  } catch (e) {
    console.error(`Fel vid rendering av template ${templatePath}:`, e);
    return `<h1>Fel vid rendering av sida</h1><p>Kunde inte ladda mallen: ${templatePath}</p>`; // Enkel felhantering
  }
}

export async function renderPage(mainContentTemplatePath: string, controller: Controller): Promise<Response> {
  const currentYear = new Date().getFullYear();
  const headerContent = await renderTemplate("./templates/header.html", controller);
  const footerContent = await renderTemplate("./templates/footer.html", {data: { currentYear} });

  const mainContent = await renderTemplate(mainContentTemplatePath, controller);
  const htmlContent = await renderTemplate("./templates/layout.html", {
      data: {
        pageTitle: controller?.meta?.title,
        headerContent,
        mainContent,
        footerContent,
      }
    }
  );
  return new Response(htmlContent, {headers: { "Content-Type": "text/html; charset=utf-8" }});
}
