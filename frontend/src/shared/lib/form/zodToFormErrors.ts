import type { FormInstance } from 'antd';
import type { ZodError } from 'zod';

/**
 * Преобразует ошибки Zod в формат Ant Design Form.setFields().
 * Группирует сообщения по path поля (несколько ошибок по одному полю — один элемент с массивом messages).
 */
export function zodToFormErrors(error: ZodError): Parameters<FormInstance['setFields']>[0] {
  const byPath = new Map<string, { name: (string | number)[]; messages: string[] }>();

  for (const issue of error.issues) {
    const pathKey = JSON.stringify(issue.path);
    const name = issue.path.length > 0 ? (issue.path as (string | number)[]) : ['root'];
    if (!byPath.has(pathKey)) {
      byPath.set(pathKey, { name, messages: [] });
    }
    byPath.get(pathKey)!.messages.push(issue.message);
  }

  return Array.from(byPath.values()).map(({ name, messages }) => ({
    name,
    errors: messages,
  }));
}
