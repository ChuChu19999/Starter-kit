import { Helmet } from 'react-helmet';
import { BiCog } from 'react-icons/bi';
import './Layout.css';

interface LayoutProps {
  title: string;
  settings?: boolean;
  headerClassName?: string;
  bodyClassName?: string;
  onSettingsClick?: () => void;
  children?: React.ReactNode;
}

const Layout = ({
  title,
  settings,
  headerClassName,
  bodyClassName,
  onSettingsClick,
  children,
}: LayoutProps) => (
  <div className={`layout-wrapper ${bodyClassName || ''}`}>
    <Helmet>
      <title>{title}</title>
    </Helmet>
    <div className={`layout ${bodyClassName || ''}`}>
      <div className={`${headerClassName || ''} header`}>
        <p className="header-text">{title}</p>
        {settings && (
          <span
            className="header-settings"
            role="button"
            tabIndex={0}
            onClick={onSettingsClick}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSettingsClick?.();
              }
            }}
            aria-label="Настройки"
          >
            <BiCog color="#BDBFC1" size={25} aria-hidden />
          </span>
        )}
      </div>
      <div className="content">{children}</div>
    </div>
  </div>
);

export default Layout;
