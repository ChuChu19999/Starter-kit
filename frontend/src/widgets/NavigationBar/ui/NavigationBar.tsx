import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Tooltip from '../../../shared/ui/Tooltip/Tooltip';
import './NavigationBar.css';

interface Breadcrumb {
  id?: string;
  label: string;
  onClick?: () => void;
}

const EMPTY_BREADCRUMBS: Breadcrumb[] = [];

interface NavigationBarProps {
  breadcrumbs?: Breadcrumb[];
  onBack?: () => void;
  showBack?: boolean;
  disabledBack?: boolean;
}

const NavigationBar = ({
  breadcrumbs = EMPTY_BREADCRUMBS,
  onBack,
  showBack = true,
  disabledBack = false,
}: NavigationBarProps) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="navigation-bar">
      <div className="navigation-bar-left">
        {showBack && (
          <Tooltip title="Назад">
            <button
              type="button"
              className={`nav-button nav-button-back ${disabledBack ? 'disabled' : ''}`}
              onClick={disabledBack ? undefined : handleBackClick}
              disabled={disabledBack}
            >
              <ArrowLeftOutlined />
            </button>
          </Tooltip>
        )}
        {breadcrumbs.length > 0 && (
          <div className="breadcrumbs">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.id ?? crumb.label}>
                {index > 0 && <span className="breadcrumb-separator">/</span>}
                <span
                  role={crumb.onClick ? 'button' : undefined}
                  tabIndex={crumb.onClick ? 0 : undefined}
                  className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : ''}`}
                  onClick={crumb.onClick}
                  onKeyDown={
                    crumb.onClick
                      ? e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            crumb.onClick?.();
                          }
                        }
                      : undefined
                  }
                  style={{ cursor: crumb.onClick ? 'pointer' : 'default' }}
                >
                  {crumb.label}
                </span>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NavigationBar;
