import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import animation from '../../shared/assets/animations/main_loading.json';
import './LoadingPage.css';

const MIN_LOADING_TIME = 2000; // Минимальное время отображения лоадера (2 секунды)

interface LoadingPageProps {
  isLoading: boolean;
  onFadeOutComplete?: () => void;
}

const LoadingPage = ({ isLoading, onFadeOutComplete }: LoadingPageProps) => {
  const [shouldShow, setShouldShow] = useState(true);

  useEffect(() => {
    if (isLoading) {
      const id = setTimeout(() => setShouldShow(true), 0);
      return () => clearTimeout(id);
    }

    const startTime = Date.now();
    const remainingTime = Math.max(0, MIN_LOADING_TIME - (Date.now() - startTime));

    const timer = setTimeout(() => {
      setShouldShow(false);
      if (onFadeOutComplete) {
        setTimeout(onFadeOutComplete, 300);
      }
    }, remainingTime);

    return () => clearTimeout(timer);
  }, [isLoading, onFadeOutComplete]);

  return (
    <div className={`loading-page-wrapper ${shouldShow ? 'loading' : 'hidden'}`}>
      <Lottie animationData={animation} loop autoplay />
    </div>
  );
};

export default LoadingPage;
