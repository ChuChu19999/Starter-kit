import React, { useReducer, useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CloseCircleFilled } from '@ant-design/icons';
import { message } from 'antd';
import { LoadingCard } from '../../../features/Cards';
import { employeesApi } from '../../../shared/api/employees';
import { Input } from '../../../shared/ui/FormItems';
import './UserPicker.css';

type PickerState = {
  options: Employee[];
  loading: boolean;
  dropdownPosition: { top: number; left: number; width: number };
};

type PickerAction =
  | { type: 'SET_OPTIONS'; payload: Employee[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_POSITION'; payload: PickerState['dropdownPosition'] };

function pickerReducer(state: PickerState, action: PickerAction): PickerState {
  switch (action.type) {
    case 'SET_OPTIONS':
      return { ...state, options: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_POSITION':
      return { ...state, dropdownPosition: action.payload };
    default:
      return state;
  }
}

const initialPickerState: PickerState = {
  options: [],
  loading: false,
  dropdownPosition: { top: 0, left: 0, width: 0 },
};

export interface EmployeePhoto {
  photoWebp50?: string | null;
  photoWebp50sha256?: string;
  photoWebp300?: string | null;
  photoJpg300sha256?: string;
  photoWebp200?: string | null;
  photoWebp200Sha256?: string;
}

export interface Employee {
  hashMd5: string;
  fullName: string;
  employeePhoto?: EmployeePhoto | null;
  jobTitle?: string;
  [key: string]: unknown;
}

interface UserPickerProps {
  value?: Employee | null;
  onChange?: (employee: Employee | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  error?: string;
}

interface UserPickerDropdownProps {
  options: Employee[];
  loading: boolean;
  dropdownPosition: PickerState['dropdownPosition'];
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  onSelect: (employee: Employee) => void;
  getPhotoUrl: (photo: EmployeePhoto | null | undefined) => string;
  onImageError: (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
    photo: EmployeePhoto | null | undefined
  ) => void;
}

const UserPickerDropdown: React.FC<UserPickerDropdownProps> = ({
  options,
  loading,
  dropdownPosition,
  dropdownRef,
  onSelect,
  getPhotoUrl,
  onImageError,
}) => {
  const content = (
    <div
      ref={dropdownRef}
      className="user-picker-dropdown"
      style={{
        position: 'absolute',
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`,
      }}
    >
      <LoadingCard loading={loading} />
      {!loading &&
        options.map(emp => {
          const photoUrl = getPhotoUrl(emp.employeePhoto);
          return (
            <div
              key={emp.hashMd5}
              className="user-picker-option"
              role="button"
              tabIndex={0}
              onClick={() => onSelect(emp)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(emp);
                }
              }}
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={emp.fullName}
                  className="user-picker-option-photo"
                  onError={e => onImageError(e, emp.employeePhoto)}
                  loading="lazy"
                />
              ) : (
                <div className="user-picker-option-photo-placeholder">
                  {emp.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="user-picker-option-content">
                <span className="user-picker-option-name">{emp.fullName}</span>
                {emp.jobTitle && (
                  <span className="user-picker-option-job-title">{emp.jobTitle}</span>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
  return createPortal(content, document.body);
};

const UserPicker: React.FC<UserPickerProps> = ({
  value,
  onChange,
  placeholder = 'Введите ФИО сотрудника',
  disabled = false,
  className = '',
  style,
  error,
}) => {
  const [searchText, setSearchText] = useState('');
  const [pickerState, dispatchPicker] = useReducer(pickerReducer, initialPickerState);
  const { options, loading, dropdownPosition } = pickerState;
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inputValue = value != null ? value.fullName || '' : searchText;

  useEffect(() => {
    const updatePosition = () => {
      if (inputRef.current && options.length > 0) {
        const rect = inputRef.current.getBoundingClientRect();
        dispatchPicker({
          type: 'SET_POSITION',
          payload: { top: rect.bottom + 4, left: rect.left, width: rect.width },
        });
      }
    };

    if (options.length > 0) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, { passive: true, capture: true });
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [options.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        dispatchPicker({ type: 'SET_OPTIONS', payload: [] });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const performSearch = useCallback(
    async (text: string) => {
      if (!text || text.length < 3) {
        dispatchPicker({ type: 'SET_OPTIONS', payload: [] });
        if (onChange && text.length === 0) {
          onChange(null);
        }
        return;
      }

      dispatchPicker({ type: 'SET_LOADING', payload: true });
      try {
        const data = await employeesApi.searchByFio(text, true);
        dispatchPicker({ type: 'SET_OPTIONS', payload: Array.isArray(data) ? data : [] });
      } catch (err) {
        console.error('Ошибка при поиске сотрудников:', err);
        message.error('Не удалось загрузить список сотрудников');
        dispatchPicker({ type: 'SET_OPTIONS', payload: [] });
      } finally {
        dispatchPicker({ type: 'SET_LOADING', payload: false });
      }
    },
    [onChange]
  );

  const handleSearch = useCallback(
    (text: string) => {
      if (value != null && text !== value.fullName) {
        onChange?.(null);
      }
      setSearchText(text);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (!text || text.length < 3) {
        dispatchPicker({ type: 'SET_OPTIONS', payload: [] });
        if (onChange && text.length === 0) {
          onChange(null);
        }
        return;
      }

      debounceTimerRef.current = setTimeout(() => {
        performSearch(text);
      }, 300);
    },
    [onChange, performSearch, value]
  );

  const handleSelect = (employee: Employee) => {
    setSearchText(employee.fullName);
    dispatchPicker({ type: 'SET_OPTIONS', payload: [] });
    if (onChange) {
      onChange(employee);
    }
  };

  const handleClear = () => {
    setSearchText('');
    dispatchPicker({ type: 'SET_OPTIONS', payload: [] });
    if (onChange) {
      onChange(null);
    }
  };

  const formatPhotoUrl = (photoString: string): string => {
    if (!photoString || !photoString.trim()) return '';

    const trimmed = photoString.trim();

    if (trimmed.startsWith('data:')) {
      return trimmed;
    }

    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('//')
    ) {
      return trimmed;
    }

    try {
      new URL(trimmed);
      return trimmed;
    } catch {
      return `data:image/webp;base64,${trimmed}`;
    }
  };

  const getPhotoUrl = (photo: EmployeePhoto | null | undefined): string => {
    if (!photo) return '';
    if (photo.photoWebp50) {
      const url = formatPhotoUrl(photo.photoWebp50);
      if (url) return url;
    }
    if (photo.photoWebp200) {
      const url = formatPhotoUrl(photo.photoWebp200);
      if (url) return url;
    }
    if (photo.photoWebp300) {
      const url = formatPhotoUrl(photo.photoWebp300);
      if (url) return url;
    }
    // Если нет ни одного фото, возвращаем пустую строку для показа placeholder
    return '';
  };

  const getFallbackPhotoUrl = (
    photo: EmployeePhoto | null | undefined,
    currentUrl: string
  ): string | null => {
    if (!photo) return null;
    const formatted200 = photo.photoWebp200 ? formatPhotoUrl(photo.photoWebp200) : '';
    const formatted50 = photo.photoWebp50 ? formatPhotoUrl(photo.photoWebp50) : '';
    const formatted300 = photo.photoWebp300 ? formatPhotoUrl(photo.photoWebp300) : '';

    if (currentUrl === formatted200) {
      if (formatted50) return formatted50;
      if (formatted300) return formatted300;
    }
    if (currentUrl === formatted50 && formatted300) {
      return formatted300;
    }
    if (currentUrl === formatted300 && formatted50) {
      return formatted50;
    }
    return null;
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
    photo: EmployeePhoto | null | undefined
  ) => {
    const img = e.currentTarget;
    const fallbackUrl = getFallbackPhotoUrl(photo, img.src);
    if (fallbackUrl) {
      img.src = fallbackUrl;
    } else {
      img.style.display = 'none';
      const placeholder = document.createElement('div');
      placeholder.className = 'user-picker-option-photo-placeholder';
      placeholder.textContent = (img.alt || '?').charAt(0).toUpperCase();
      img.parentNode?.insertBefore(placeholder, img);
    }
  };

  return (
    <div ref={containerRef} className={`user-picker-container ${className}`} style={style}>
      <div ref={inputRef}>
        <Input
          value={inputValue}
          placeholder={placeholder}
          disabled={disabled}
          onChange={e => handleSearch(e.target.value)}
          suffix={
            value ? (
              <span
                role="button"
                tabIndex={0}
                className="user-picker-clear-icon"
                onClick={handleClear}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClear();
                  }
                }}
              >
                <CloseCircleFilled />
              </span>
            ) : null
          }
          className={error ? 'user-picker-input-error' : ''}
        />
      </div>
      {error && <div className="user-picker-error">{error}</div>}
      {options.length > 0 && !value && (
        <UserPickerDropdown
          options={options}
          loading={loading}
          dropdownPosition={dropdownPosition}
          dropdownRef={dropdownRef}
          onSelect={handleSelect}
          getPhotoUrl={getPhotoUrl}
          onImageError={handleImageError}
        />
      )}
    </div>
  );
};

export default UserPicker;
