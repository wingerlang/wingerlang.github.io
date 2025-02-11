export function getValue(data: any, path: string): string {
  const keys = path.split(".");
  let value = data;
  for (const key of keys) {
    if (value == null || !(key in value)) {
      return "";
    }
    value = value[key];
  }
  return String(value);
}

export function flattenObject(obj: any, prefix = "", result = {}) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (Array.isArray(value)) {
        value.forEach((arrayValue, index) => {
          const arrayKey = `${newKey}[${index}]`;
          if (typeof arrayValue === "object" && arrayValue !== null) {
            flattenObject(arrayValue, arrayKey, result);
          } else {
            result[arrayKey] = arrayValue;
          }
        });
      } else if (typeof value === "object" && value !== null) {
        flattenObject(value, newKey, result);
      } else {
        result[newKey] = value;
      }
    }
  }
  return result;
}

export const handleLoops = (template: string, data: any) => {
  const loopsRegExp = new RegExp(
    /{{\s*foreach\s*(.*?)\s*in\s*(.*?)\s*}}(.*?){{\s*\/foreach\s*}}/,
    "mis",
  );
  let processedTemplate = template;
  let match;

  while ((match = processedTemplate.match(loopsRegExp))) {
    const [fullMatch, iterator, listName, content] = match;

    let generatedHTML = "";
    if (data[listName]) {
      const list = data[listName];
      for (const item of list) {
        let itemHTML = content;
        const innerRegExp = new RegExp(`{{\\s*${iterator}\\.(\\w+)\\s*}}`, "s");
        let innerMatch;
        while ((innerMatch = itemHTML.match(innerRegExp))) {
          const placeholder = innerMatch[0];
          const propertyName = innerMatch[1];
          //const value = item[propertyName]; // This is the original code
          const value = `{{ ${listName}[${
            list.indexOf(item)
          }].${propertyName} }}`;
          itemHTML = itemHTML.replace(
            placeholder,
            value !== undefined ? value : "",
          );
        }
        generatedHTML += itemHTML;
      }
    }
    processedTemplate = processedTemplate.replace(fullMatch, generatedHTML);
  }
  return removeWhiteSpace(processedTemplate);
};

export const extractValuesInTemplate = (template: string, data: any) => {
  const flatData: Record<string, string> = flattenObject(data);

  for (const key in flatData) {
    const placeholder = `{{\\s*${escapeRegExp(key)}\\s*}}`;
    const regex = new RegExp(placeholder, "ig");
    const value = String(flatData[key]);
    template = template.replaceAll(regex, value);
  }
  return template;
};

export const getFileExtension = (s: string): string | undefined =>
  /\.(.*)$/.exec(s)?.[1];
export const mapContentType = (input: string | undefined): string | undefined =>
  input ? ContentType[input] : input;

export const ContentType: Record<string, string> = {
  "css": "text/css",
  "js": "text/javascript",
  "png": "image/png",
  "jpg": "image/jpeg",
  "jpeg": "image/jpeg",
  "gif": "image/gif",
  "svg": "image/svg+xml",
  "html": "text/html; charset=utf-8",
};

export const removeWhiteSpace = (s: string): string =>
  s.replace(/\s+/g, " ").trim();

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const isObject = (value: any): boolean => {
  return value !== null && typeof value === "object";
};
export const isFunction = (value: any): boolean => {
  return typeof value === "function";
};
export const isUndefinedOrNull = (value: any): boolean => {
  return value === undefined || value === null;
};
export const isString = (value: any): boolean => {
  return typeof value === "string";
};
export const getJsonHeaders = () => {
  return { "Content-Type": "application/json" };
};
