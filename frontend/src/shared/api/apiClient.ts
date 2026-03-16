import { axiosInstance } from '../config/axios';
import { API_URL } from '../config/process';
import { createApiClient } from './generated';
import { TanstackQueryApiClient } from './tanstack.client';
import type { Fetcher } from './generated';

/**
 * Fetcher для typed-openapi: выполняет запросы через существующий axios instance
 * (с Keycloak-интерсепторами и baseURL). Конвертирует ответ в Fetch API Response.
 */
const axiosFetcher: Fetcher = {
  fetch: async ({ method, url, urlSearchParams, parameters }) => {
    const fullUrl = urlSearchParams
      ? `${url.toString()}?${urlSearchParams.toString()}`
      : url.toString();

    const response = await axiosInstance.request({
      method: method.toUpperCase(),
      url: fullUrl,
      data: parameters?.body,
      headers: (parameters?.header ?? {}) as Record<string, string>,
    });

    const body =
      typeof response.data === 'object' && response.data !== null
        ? JSON.stringify(response.data)
        : String(response.data ?? '');

    const headers = new Headers();
    if (response.headers && typeof response.headers === 'object') {
      Object.entries(response.headers).forEach(([key, value]) => {
        if (value != null) headers.set(key, String(value));
      });
    }

    return new Response(body, {
      status: response.status,
      statusText: response.statusText ?? '',
      headers,
    });
  },
};

export const api = createApiClient(axiosFetcher, API_URL ?? '');
export const tanstackApi = new TanstackQueryApiClient(api);
