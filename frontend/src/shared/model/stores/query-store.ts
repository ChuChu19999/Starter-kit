import { create } from 'zustand';
import { logger } from '../../lib/zustand/middleware';
import type { QueryState } from '../../lib/zustand/types';

/**
 * Базовый Query Store для шаблона
 * Используется для управления параметрами запросов (пагинация, фильтры, сортировка)
 *
 * Для конкретного проекта можно расширить этот интерфейс, добавив специфичные query состояния
 * Пример расширения:
 *
 * interface MyEntityQueryState extends QueryState {
 *   filters?: {
 *     name?: string;
 *     status?: string[];
 *   };
 * }
 *
 * interface QueryStore {
 *   myEntityQuery: MyEntityQueryState;
 *   setMyEntityPage: (page: number) => void;
 *   setMyEntityPageSize: (pageSize: number) => void;
 *   setMyEntityFilters: (filters: MyEntityQueryState['filters']) => void;
 *   resetMyEntityQuery: () => void;
 *   resetAllQueries: () => void;
 * }
 */
interface QueryStore {
  // Метод для сброса всех query состояний
  resetAllQueries: () => void;
}

/**
 * Дефолтное состояние для query параметров
 * Используется при расширении store для инициализации новых query состояний
 */
export const defaultQueryState: QueryState = {
  page: 1,
  pageSize: 20,
};

/**
 * Query Store - управление параметрами запросов
 * Использует logger middleware для логирования изменений в режиме разработки
 */
export const useQueryStore = create<QueryStore>()(
  logger(() => ({
    // Сброс всех query состояний
    resetAllQueries: () => {
      // В базовом шаблоне это пустая функция
      // При расширении store добавьте сброс всех специфичных query состояний
    },
  }))
);
