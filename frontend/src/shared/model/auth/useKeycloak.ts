import { useEffect, useReducer } from 'react';
import KeycloakService from '../../../KeycloakService';

interface UseKeycloakReturn {
  isLoading: boolean;
  isAuthenticated: boolean;
  username: string;
  error: Error | null;
}

type KeycloakState = {
  isLoading: boolean;
  isAuthenticated: boolean;
  username: string;
  error: Error | null;
};

type KeycloakAction =
  | { type: 'INIT_START' }
  | { type: 'INIT_SUCCESS'; payload: { username: string } }
  | { type: 'INIT_ERROR'; payload: Error };

const initialKeycloakState: KeycloakState = {
  isLoading: true,
  isAuthenticated: false,
  username: '',
  error: null,
};

function keycloakReducer(state: KeycloakState, action: KeycloakAction): KeycloakState {
  switch (action.type) {
    case 'INIT_START':
      return { ...state, isLoading: true, error: null };
    case 'INIT_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        username: action.payload.username,
        error: null,
      };
    case 'INIT_ERROR':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        username: '',
        error: action.payload,
      };
    default:
      return state;
  }
}

export const useKeycloak = (): UseKeycloakReturn => {
  const [state, dispatch] = useReducer(keycloakReducer, initialKeycloakState);

  useEffect(() => {
    const initializeKeycloak = async () => {
      dispatch({ type: 'INIT_START' });
      try {
        const tokenData = await KeycloakService.init();
        dispatch({
          type: 'INIT_SUCCESS',
          payload: { username: tokenData?.fullName || '' },
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error('Не удалось инициализировать Keycloak:', error);
        dispatch({ type: 'INIT_ERROR', payload: error });
      }
    };

    initializeKeycloak();
  }, []);

  return {
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    username: state.username,
    error: state.error,
  };
};
