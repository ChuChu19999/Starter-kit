import { Navigate } from 'react-router-dom';

/**
 * Страница перезагрузки: перенаправляет на главную (используется после выхода/обновления токена).
 */
export function ReloadPage() {
  return <Navigate to="/" replace />;
}
