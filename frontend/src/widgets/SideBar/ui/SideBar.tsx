import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BiChevronsRight, BiUser } from 'react-icons/bi';
import { routersData } from '../../../app/data';
import logoImage from '../../../shared/assets/logo/logo.png';
import './SideBar.css';

interface SideBarProps {
  username: string;
  isAdmin: boolean;
  onMinimizeChange?: (value: boolean) => void;
}

type RouterItem = {
  label: string;
  path: string;
  icon: React.ReactElement;
  element: React.ReactElement;
  children?: RouterItem[];
  doNotShowChildrenInSideBar?: boolean;
};

interface SideBarMenuItemsProps {
  items: RouterItem[];
  level: number;
  parentPath: string;
  openSubmenus: string[];
  pathname: string;
  search: string;
  minimize: boolean;
  getBasePath: (pathname: string) => string;
  toggleSubmenu: (path: string, level: number) => void;
  openLocationSubmenus: () => void;
  navigate: (opts: { pathname: string; search: string }, opts2: { replace: boolean }) => void;
  setOpenSubmenus: React.Dispatch<React.SetStateAction<string[]>>;
  setMinimize: (value: boolean) => void;
  buttonRef: React.RefObject<HTMLDivElement | null>;
}

const SideBarMenuItems = ({
  items,
  level,
  parentPath,
  openSubmenus,
  pathname,
  search,
  minimize,
  getBasePath,
  toggleSubmenu,
  openLocationSubmenus,
  navigate,
  setOpenSubmenus,
  setMinimize,
  buttonRef,
}: SideBarMenuItemsProps) => (
  <>
    {items.map(item => {
      const currentPath = `${parentPath}${item.path}`;
      const isOpen = openSubmenus.includes(currentPath);
      const isCurrentPath =
        ((!openSubmenus.length || level !== 0) &&
          (pathname === currentPath ||
            (currentPath === '/users' && pathname.startsWith('/user-cabinet/')))) ||
        isOpen;

      const openSubmenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMinimize(false);
        if (pathname !== '/' && pathname.startsWith(currentPath)) {
          openLocationSubmenus();
          return;
        }
        toggleSubmenu(currentPath, level);
      };

      const navigateOnClick = () => {
        const targetPath = currentPath || '/';
        const currentBasePath = getBasePath(pathname);
        const targetBasePath = getBasePath(targetPath);
        const searchToKeep = currentBasePath === targetBasePath ? search : '';
        navigate({ pathname: targetPath, search: searchToKeep }, { replace: true });
        setOpenSubmenus([]);
      };

      return (
        <li key={currentPath} className="sidebar-item">
          <div
            ref={buttonRef}
            role="button"
            tabIndex={0}
            className={`${isCurrentPath ? 'menu-item-active' : 'menu-item'} item-level-${level} menu-item-transition`}
            onClick={
              item.children?.length && !item.doNotShowChildrenInSideBar
                ? openSubmenu
                : navigateOnClick
            }
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (item.children?.length && !item.doNotShowChildrenInSideBar) {
                  openSubmenu(e as unknown as React.MouseEvent);
                } else {
                  navigateOnClick();
                }
              }
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>

          {item.children?.length && !item.doNotShowChildrenInSideBar && isOpen && (
            <ul
              className={`submenu level-${level + 1} ${minimize ? 'submenu-margin-collapsed' : 'submenu-margin-expanded'}`}
            >
              <div className="submenu-title">{item.label}</div>
              <SideBarMenuItems
                items={item.children}
                level={level + 1}
                parentPath={currentPath}
                openSubmenus={openSubmenus}
                pathname={pathname}
                search={search}
                minimize={minimize}
                getBasePath={getBasePath}
                toggleSubmenu={toggleSubmenu}
                openLocationSubmenus={openLocationSubmenus}
                navigate={navigate}
                setOpenSubmenus={setOpenSubmenus}
                setMinimize={setMinimize}
                buttonRef={buttonRef}
              />
            </ul>
          )}
        </li>
      );
    })}
  </>
);

const SideBar = ({ username, isAdmin, onMinimizeChange }: SideBarProps) => {
  const [minimize, setMinimize] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<string[]>([]);
  const buttonRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const getBasePath = useCallback((pathname: string): string => {
    if (pathname === '/') {
      return '/';
    }
    const segments = pathname.split('/').filter(segment => segment.length > 0);
    return segments.length > 0 ? `/${segments[0]}` : '/';
  }, []);

  const allowedRoutes = isAdmin
    ? routersData
    : routersData.filter(route => route.path === '/' || route.path === '/help');

  const toggleSubmenu = useCallback(
    (path: string, level = 0) => {
      const isOpen = openSubmenus.includes(path);
      if (level === 0) {
        if (isOpen) {
          setOpenSubmenus([]);
          return;
        }
        setOpenSubmenus([path]);
        return;
      }
      if (isOpen) {
        setOpenSubmenus(prevSubmenus => prevSubmenus.filter(item => !item.startsWith(path)));
        return;
      }
      setOpenSubmenus(prevSubmenus => [...prevSubmenus, path]);
    },
    [openSubmenus]
  );

  const openLocationSubmenus = useCallback(() => {
    let previousPath = '';
    const locationSplit = location.pathname.split('/').filter(item => item.length);
    locationSplit.pop();
    const locationPaths = locationSplit.map(item => {
      previousPath += '/' + item;
      return previousPath;
    });
    locationPaths.forEach((item, index) => toggleSubmenu(item, index));
  }, [location, toggleSubmenu]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openSubmenus.length && !buttonRef.current?.contains(event.target as Node)) {
        setOpenSubmenus([]);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openSubmenus.length]);

  const toggleMenu = () => {
    const newMinimize = !minimize;
    setMinimize(newMinimize);
    onMinimizeChange?.(newMinimize);
    setOpenSubmenus([]);
  };

  return (
    <div ref={buttonRef} className={`sidebar-wrapper ${minimize ? 'collapsed' : ''}`}>
      <div className="content">
        <div className="logo-container">
          <img
            src={logoImage}
            alt="Starter Kit"
            className={`sidebar-logo ${minimize ? 'collapsed' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => {
              const currentBasePath = getBasePath(location.pathname);
              const search = currentBasePath === '/' ? location.search : '';
              navigate({ pathname: '/', search }, { replace: true });
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const currentBasePath = getBasePath(location.pathname);
                const search = currentBasePath === '/' ? location.search : '';
                navigate({ pathname: '/', search }, { replace: true });
              }
            }}
            onMouseEnter={e => {
              e.currentTarget.style.opacity = '0.8';
              e.currentTarget.style.transform = 'scale(1.03)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          />
        </div>

        <ul className="sidebar">
          <SideBarMenuItems
            items={allowedRoutes}
            level={0}
            parentPath=""
            openSubmenus={openSubmenus}
            pathname={location.pathname}
            search={location.search}
            minimize={minimize}
            getBasePath={getBasePath}
            toggleSubmenu={toggleSubmenu}
            openLocationSubmenus={openLocationSubmenus}
            navigate={navigate}
            setOpenSubmenus={setOpenSubmenus}
            setMinimize={setMinimize}
            buttonRef={buttonRef}
          />
        </ul>
      </div>

      <div className="footer">
        <span
          role="button"
          tabIndex={0}
          className="arrowButton"
          onClick={toggleMenu}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleMenu();
            }
          }}
        >
          <BiChevronsRight size={25} />
        </span>

        <div className="user">
          <BiUser className="user-icon" size={25} />

          {!minimize && username && <p className="user-name">{username}</p>}
        </div>
      </div>
    </div>
  );
};

export default SideBar;
