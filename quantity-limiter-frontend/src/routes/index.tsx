import Layout from '@/components/Layout';
import { PATH } from '@/constants/path';
import Appearance from '@/pages/Appearance';
import Home from '@/pages/Home';
import Rules from '@/pages/Rules';
import CreateRule from '@/pages/Rules/components/CreateRule';
import React from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';

interface IRouter {
  path: string;
  element: React.ReactNode;
  isShowSideBar?: boolean;
}

const router: Array<IRouter> = [
  {
    path: PATH.DEFAULT.pathname,
    element: <Home />,
  },
  {
    path: PATH.RULES.pathname,
    element: <Rules />,
  },
  {
    path: PATH.CREATE_RULE.pathname,
    element: <CreateRule />,
  },
  {
    path: PATH.APPEARANCE.pathname,
    element: <Appearance />,
  },
  {
    path: PATH.ANALYTICS.pathname,
    element: <div>Analytics</div>,
  },
  {
    path: PATH.GENERAL_SETTINGS.pathname,
    element: <div>Theme & colors</div>,
  },
  {
    path: PATH.TRANSLATION.pathname,
    element: <div>Translation</div>,
  },
  {
    path: PATH.PRICING_PLAN.pathname,
    element: <div>Pricing</div>,
  },
  {
    path: PATH.CREATE_RULE.pathname,
    element: <div>CURule</div>,
  },
  {
    path: PATH.EDIT_RULE.pathname,
    element: <CreateRule />,
  },
  {
    path: PATH.CREATE_CHECKOUT_EXTENSION.pathname,
    element: <div>CreateShippingCheckout</div>,
  },
  {
    path: PATH.EDIT_CHECKOUT_EXTENSION.pathname,
    element: <div>CreateShippingCheckout</div>,
  },
  {
    path: PATH.EDIT_CHECKOUT_APPEARANCE.pathname,
    element: <div>EditAppearance</div>,
  },
  {
    path: PATH.EDIT_CHECKOUT_PRODUCT_LINE_ITEMS.pathname,
    element: <div>EditProductLineItems</div>,
  },
  {
    path: PATH.WELCOME.pathname,
    element: <div>Onboarding</div>,
    isShowSideBar: false,
  },
];

const newUserRouter: Array<IRouter> = [
  {
    path: PATH.PRICING_PLAN.pathname,
    element: <div>Pricing</div>,
  },
];

interface ILayoutRouteProps {
  fullWidth?: boolean;
  isShowSideBar?: boolean;
}

const LayoutRoute = ({ isShowSideBar }: ILayoutRouteProps): JSX.Element => {
  const location = useLocation();
  const allRoutes = [...router, ...newUserRouter];
  const currentRoute = allRoutes.find((route) => location.pathname.includes(route.path));
  const routeShowSidebar = currentRoute?.isShowSideBar !== undefined ? currentRoute.isShowSideBar : isShowSideBar;

  return (
    <Layout isShowSideBar={routeShowSidebar}>
      <Outlet />
    </Layout>
  );
};

function RenderRouter({ newUser }: { newUser?: boolean }): JSX.Element {
  const routesToRender = newUser ? newUserRouter : router;

  return (
    <Routes>
      <Route element={<LayoutRoute />}>
        {routesToRender.map((item: IRouter) => (
          <Route key={item.path} path={item.path} element={item.element} />
        ))}
      </Route>
      <Route path="*" element={<Navigate to={newUser ? PATH.PRICING_PLAN : PATH.DEFAULT} replace />} />
    </Routes>
  );
}
export default RenderRouter;
