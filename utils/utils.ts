
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