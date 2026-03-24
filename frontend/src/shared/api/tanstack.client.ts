import { queryOptions } from '@tanstack/react-query';
import { errorStatusCodes, TypedStatusError } from './generated.ts';
import type {
  EndpointByMethod,
  ApiClient,
  SuccessStatusCode,
  ErrorStatusCode,
  InferResponseByStatus,
  TypedSuccessResponse,
} from './generated.ts';

type EndpointQueryKey<TOptions extends EndpointParameters> = [
  TOptions & {
    _id: string;
    _infinite?: boolean;
  },
];

const createQueryKey = <TOptions extends EndpointParameters>(
  id: string,
  options?: TOptions,
  infinite?: boolean
): [EndpointQueryKey<TOptions>[0]] => {
  const params: EndpointQueryKey<TOptions>[0] = { _id: id } as EndpointQueryKey<TOptions>[0];
  if (infinite) {
    params._infinite = infinite;
  }
  if (options?.body) {
    params.body = options.body;
  }
  if (options?.header) {
    params.header = options.header;
  }
  if (options?.path) {
    params.path = options.path;
  }
  if (options?.query) {
    params.query = options.query;
  }
  return [params];
};

// <EndpointByMethod.Shorthands>
export type GetEndpoints = EndpointByMethod['get'];
export type PostEndpoints = EndpointByMethod['post'];
// </EndpointByMethod.Shorthands>

// <ApiClientTypes>
export type EndpointParameters = {
  body?: unknown;
  query?: Record<string, unknown>;
  header?: Record<string, unknown>;
  path?: Record<string, unknown>;
};

type RequiredKeys<T> = {
  [P in keyof T]-?: undefined extends T[P] ? never : P;
}[keyof T];

type MaybeOptionalArg<T> = RequiredKeys<T> extends never ? [config?: T] : [config: T];

type InferResponseData<TEndpoint, TStatusCode> =
  TypedSuccessResponse<any, any, any> extends InferResponseByStatus<TEndpoint, TStatusCode>
    ? Extract<InferResponseByStatus<TEndpoint, TStatusCode>, { data: {} }>['data']
    : Extract<InferResponseByStatus<TEndpoint, TStatusCode>['data'], {}>;

// </ApiClientTypes>

// <ApiClient>
export class TanstackQueryApiClient {
  constructor(public client: ApiClient) {}

  // <ApiClient.get>
  get<Path extends keyof GetEndpoints, TEndpoint extends GetEndpoints[Path]>(
    path: Path,
    ...params: MaybeOptionalArg<TEndpoint['parameters']>
  ) {
    const queryKey = createQueryKey(path as string, params[0]);
    const query = {
      /** Только для типов: удобный доступ к параметрам эндпоинта. */
      '~endpoint': {} as TEndpoint,
      queryKey,
      queryFn: {} as 'В useQuery передавайте .queryOptions',
      queryOptions: queryOptions({
        queryFn: async ({ queryKey, signal }) => {
          const requestParams = {
            ...((params[0] as EndpointParameters | undefined) || {}),
            ...((queryKey[0] as EndpointParameters | undefined) || {}),
            overrides: { signal },
            withResponse: false as const,
          };
          const res = await this.client.get(path, requestParams as never);
          return res as InferResponseData<TEndpoint, SuccessStatusCode>;
        },
        queryKey: queryKey,
      }),
    };

    return query;
  }
  // </ApiClient.get>

  // <ApiClient.post>
  post<Path extends keyof PostEndpoints, TEndpoint extends PostEndpoints[Path]>(
    path: Path,
    ...params: MaybeOptionalArg<TEndpoint['parameters']>
  ) {
    const queryKey = createQueryKey(path as string, params[0]);
    const query = {
      /** Только для типов: удобный доступ к параметрам эндпоинта. */
      '~endpoint': {} as TEndpoint,
      queryKey,
      queryFn: {} as 'В useQuery передавайте .queryOptions',
      queryOptions: queryOptions({
        queryFn: async ({ queryKey, signal }) => {
          const requestParams = {
            ...((params[0] as EndpointParameters | undefined) || {}),
            ...((queryKey[0] as EndpointParameters | undefined) || {}),
            overrides: { signal },
            withResponse: false as const,
          };
          const res = await this.client.post(path, requestParams as never);
          return res as InferResponseData<TEndpoint, SuccessStatusCode>;
        },
        queryKey: queryKey,
      }),
    };

    return query;
  }
  // </ApiClient.post>

  // <ApiClient.request>
  /**
   * Универсальная мутация с полной типизацией для любого эндпоинта.
   * Параметры можно не передавать при создании, а передать при вызове mutation.mutate().
   */
  mutation<
    TMethod extends keyof EndpointByMethod,
    TPath extends keyof EndpointByMethod[TMethod],
    TEndpoint extends EndpointByMethod[TMethod][TPath],
    TWithResponse extends boolean = false,
    TSelection = TWithResponse extends true
      ? InferResponseByStatus<TEndpoint, SuccessStatusCode>
      : InferResponseData<TEndpoint, SuccessStatusCode>,
    TError = TEndpoint extends { responses: infer TResponses }
      ? TResponses extends Record<string | number, unknown>
        ? TypedStatusError<InferResponseData<TEndpoint, ErrorStatusCode>>
        : Error
      : Error,
  >(
    method: TMethod,
    path: TPath,
    options?: {
      withResponse?: TWithResponse;
      selectFn?: (
        res: TWithResponse extends true
          ? InferResponseByStatus<TEndpoint, SuccessStatusCode>
          : InferResponseData<TEndpoint, SuccessStatusCode>
      ) => TSelection;
      throwOnStatusError?: boolean;
      throwOnError?: boolean | ((error: TError) => boolean);
    }
  ) {
    const mutationKey = [{ method, path }] as const;
    const mutationFn = async (
      params: (TEndpoint extends { parameters: infer Parameters } ? Parameters : {}) & {
        throwOnStatusError?: boolean;
        overrides?: RequestInit;
      }
    ): Promise<TSelection> => {
      const withResponse = options?.withResponse ?? false;
      const throwOnStatusError =
        params.throwOnStatusError ?? options?.throwOnStatusError ?? (withResponse ? false : true);
      const selectFn = options?.selectFn;
      const response = await (this.client as any)[method](path, {
        ...(params as any),
        withResponse: true,
        throwOnStatusError: false,
      });

      if (throwOnStatusError && errorStatusCodes.includes(response.status as never)) {
        throw new TypedStatusError(response as never);
      }

      // При withResponse: false возвращаем только data, иначе — полный ответ.
      const finalResponse = withResponse ? response : response.data;
      const res = selectFn ? selectFn(finalResponse as any) : finalResponse;
      return res as never;
    };
    return {
      /** Только для типов: удобный доступ к параметрам эндпоинта. */
      '~endpoint': {} as TEndpoint,
      mutationKey: mutationKey,
      mutationFn: {} as 'В useMutation передавайте .mutationOptions',
      mutationOptions: {
        throwOnError: options?.throwOnError as boolean | ((error: TError) => boolean),
        mutationKey: mutationKey,
        mutationFn: mutationFn,
      } as Omit<
        import('@tanstack/react-query').UseMutationOptions<
          TSelection,
          TError,
          (TEndpoint extends { parameters: infer Parameters } ? Parameters : {}) & {
            withResponse?: boolean;
            throwOnStatusError?: boolean;
          }
        >,
        'mutationFn'
      > & {
        mutationFn: typeof mutationFn;
      },
    };
  }
  // </ApiClient.request>
}
