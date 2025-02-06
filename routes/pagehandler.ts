import { renderPage } from "../utils/template.ts";
const ext = { controller: '.ts', view: '.html' };

export const Handler = async (name: string): Promise<Response> => {
    let data = {};
    try {
        const controllerModule = await import(`../pages/${name}/${name}${ext.controller}`);
        if (controllerModule && controllerModule.data) {
            data = controllerModule.data;
        }
    } catch (error) {
        console.warn(`Controller file for page "${name}" not found or error loading:`, error);
        name = '404';
    }
    return renderPage(`./pages/${name}/${name}${ext.view}`, name, data);
};