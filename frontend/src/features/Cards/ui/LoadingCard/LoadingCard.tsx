import { useEffect, useReducer, useRef } from 'react';
import { Spin } from 'antd';
import './LoadingCard.css';

interface LoadingCardProps {
  loading?: boolean;
  minDuration?: number; // Минимальная длительность показа в миллисекундах (по умолчанию 500)
}

type LoadingState = {
  loadingEndedAt: number | null;
  position: { top: number; left: number; width: number; height: number };
};

type LoadingAction =
  | { type: 'LOADING_START' }
  | { type: 'LOADING_END_AT'; payload: number }
  | { type: 'LOADING_CLEAR' }
  | { type: 'SET_POSITION'; payload: LoadingState['position'] };

const initialState: LoadingState = {
  loadingEndedAt: null,
  position: { top: 0, left: 0, width: 0, height: 0 },
};

function loadingReducer(state: LoadingState, action: LoadingAction): LoadingState {
  switch (action.type) {
    case 'LOADING_START':
      return { ...state, loadingEndedAt: null };
    case 'LOADING_END_AT':
      return { ...state, loadingEndedAt: action.payload };
    case 'LOADING_CLEAR':
      return { ...state, loadingEndedAt: null };
    case 'SET_POSITION':
      return { ...state, position: action.payload };
    default:
      return state;
  }
}

const LoadingCard = ({ loading = true, minDuration = 500 }: LoadingCardProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number | null>(null);
  const [state, dispatch] = useReducer(loadingReducer, initialState);

  useEffect(() => {
    if (loading) {
      startTimeRef.current = Date.now();
      dispatch({ type: 'LOADING_START' });
      return;
    }
    if (startTimeRef.current === null) return;
    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, minDuration - elapsed);
    dispatch({ type: 'LOADING_END_AT', payload: Date.now() });
    const timer = setTimeout(() => dispatch({ type: 'LOADING_CLEAR' }), remaining);
    return () => clearTimeout(timer);
  }, [loading, minDuration]);

  const internalLoading = loading || state.loadingEndedAt !== null;

  useEffect(() => {
    const contentElement = wrapperRef.current?.closest('.layout-wrapper .content') as HTMLElement;
    if (!contentElement) return;

    const updatePosition = () => {
      const rect = contentElement.getBoundingClientRect();
      dispatch({
        type: 'SET_POSITION',
        payload: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      });
    };

    if (internalLoading) {
      updatePosition();

      contentElement.classList.add('loading-active');
      const scrollTop = contentElement.scrollTop;

      const preventScroll = (e: WheelEvent | TouchEvent) => {
        e.preventDefault();
      };

      const resetScroll = () => {
        contentElement.scrollTop = scrollTop;
      };

      const handleResize = () => {
        updatePosition();
      };

      // passive: false обязателен — preventDefault блокирует скролл во время лоадера
      contentElement.addEventListener('wheel', preventScroll, { passive: false });
      contentElement.addEventListener('touchmove', preventScroll, { passive: false });
      contentElement.addEventListener('scroll', resetScroll, { passive: true });
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', updatePosition, { passive: true, capture: true });

      return () => {
        contentElement.removeEventListener('wheel', preventScroll);
        contentElement.removeEventListener('touchmove', preventScroll);
        contentElement.removeEventListener('scroll', resetScroll);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', updatePosition, true);
        contentElement.classList.remove('loading-active');
      };
    } else {
      contentElement.classList.remove('loading-active');
    }
  }, [internalLoading]);

  if (!internalLoading) return null;

  return (
    <div
      ref={wrapperRef}
      className="loading-card-wrapper"
      style={{
        top: `${state.position.top}px`,
        left: `${state.position.left}px`,
        width: `${state.position.width}px`,
        height: `${state.position.height}px`,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <Spin size="large" spinning={true} />
      </div>
    </div>
  );
};

export default LoadingCard;
