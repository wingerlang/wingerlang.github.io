
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

export function flattenObject(obj: any, prefix = '', result = {}) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        flattenObject(value, newKey, result);
      } else {
        result[newKey] = value;
      }
    }
  }
  return result;
}

export const extractValuesInTemplate = (template: string, data: any) => {
  const flatData: Record<string, string> = flattenObject(data);
  for (const key in flatData) {
      const placeholder = `{{\\s*${key}\\s*}}`;
      const regex = new RegExp(placeholder, 'ig');
      const value = String(flatData[key]);
      template = template.replace(regex, value);
    }
    return template;
}

export const getFileExtension = (s: string): string|undefined => /\.(.*)$/.exec(s)?.[1];
export const mapContentType = (input: string|undefined): string|undefined => input ? ContentType[input] : input;

export const ContentType: Record<string, string> = {
  'css': 'text/css',
  'js': 'text/javascript',
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'gif': 'image/gif',
  'svg': 'image/svg+xml',
  'html': 'text/html; charset=utf-8'
}