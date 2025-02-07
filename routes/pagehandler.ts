import { renderPage } from "../utils/template.ts";
const ext = { controller: '.ts', view: '.html' };

const viewPath = (name: string): string => `./pages/${name}/${name}${ext.view}`;
const controllerPath = (name: string): string => `../pages/${name}/${name}${ext.controller}`;

export const Handler = async (name: string): Promise<Response> => {
    let data = {};
    try {
        const controllerModule = await import(controllerPath(name));
        if (controllerModule && controllerModule.data) {
            data = controllerModule.data;
        }
    } catch (error) {
        console.warn(`Controller file for page "${name}" not found or error loading:`, error);
        name = '404';
    }
    return renderPage(viewPath(name), name, data);
};