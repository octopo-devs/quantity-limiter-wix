import { config } from '@/config';
import { PATH } from '@/constants/path';
import cacheSlice, { isCacheSelector } from '@/redux/slice/cache.slice';
import { isLoadingGeneralSettingsSelector } from '@/redux/slice/loading';
import { Box, Button, IconButton, Tooltip } from '@wix/design-system';
import {
  BulletList,
  ChevronLeft,
  ChevronRight,
  ColorBucket,
  CreditCard,
  Globe,
  Home,
  List,
  PieChart,
  Settings,
  Statistics,
} from '@wix/wix-ui-icons-common';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { SidebarWrapper } from './styled';

const btnGroup = [
  {
    content: 'Home',
    icon: <Home />,
    path: PATH.DEFAULT,
  },
  {
    content: 'Setup limits',
    icon: <BulletList />,
    path: PATH.RULES,
  },
  {
    content: 'Appearance',
    icon: <ColorBucket />,
    path: PATH.APPEARANCE,
  },
  {
    content: 'Translation',
    icon: <Globe />,
    path: PATH.TRANSLATION,
  },
  {
    content: 'General settings',
    icon: <Settings />,
    path: PATH.GENERAL_SETTINGS,
  },
  {
    content: 'Analytics',
    icon: <Statistics />,
    path: PATH.ANALYTICS,
  },
  {
    content: 'Pricing plan',
    icon: <CreditCard />,
    path: PATH.PRICING_PLAN,
  },
];

interface ILayoutProps {
  isShowSideBar?: boolean;
  children?: React.ReactNode;
}

const Layout = ({ isShowSideBar = true, ...props }: ILayoutProps): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoading = useSelector(isLoadingGeneralSettingsSelector);
  const isCache = useSelector(isCacheSelector);
  const dispatch = useDispatch();
  const isEmbedded = config.embedded;
  const shouldShowSidebar = !isEmbedded && isShowSideBar;
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!isCache && !isLoading) {
      const timer = setTimeout(() => {
        dispatch(cacheSlice.actions.handleCache(true));
        return () => clearTimeout(timer);
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Box direction="horizontal" minHeight="100vh" backgroundColor="var(--p-color-bg-surface-secondary, #f6f6f7)">
      {shouldShowSidebar && (
        <SidebarWrapper $isCollapsed={isCollapsed}>
          <Box className="sidebar-content" direction="vertical" padding="small" gap="tiny">
            {btnGroup.map((item, index) => {
              const isActive =
                location.pathname.includes(item.path.pathname) || (index === 0 && location.pathname === '/');
              const buttonContent = isCollapsed ? (
                <Box style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <Tooltip content={item.content}>
                    <IconButton
                      priority={isActive ? 'primary' : 'secondary'}
                      onClick={() => {
                        navigate({
                          ...item.path,
                        });
                      }}
                      ariaLabel={item.content}
                    >
                      {item.icon}
                    </IconButton>
                  </Tooltip>
                </Box>
              ) : (
                <Button
                  priority={isActive ? 'primary' : 'secondary'}
                  prefixIcon={item.icon}
                  onClick={() => {
                    navigate({
                      ...item.path,
                    });
                  }}
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                  }}
                >
                  {item.content}
                </Button>
              );
              return <Box key={index}>{buttonContent}</Box>;
            })}
            <Box
              style={{
                position: 'absolute',
                right: '-14px',
                top: '120%',
                borderRadius: '50%',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              }}
            >
              <IconButton size="small" priority="secondary" onClick={handleToggleCollapse}>
                {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
              </IconButton>
            </Box>
          </Box>
        </SidebarWrapper>
      )}
      <Box
        direction="vertical"
        style={{
          flex: 1,
          backgroundColor: 'var(--wds-color-fill-surface-sunken, var(--wsr-color-D70, #ECEFF3))',
          maxWidth: isCollapsed ? 'calc(1665px - 60px)' : 'calc(1665px - 410px)',
          overflowY: 'hidden',
        }}
      >
        {props.children}
      </Box>
    </Box>
  );
};
export default memo(Layout);
