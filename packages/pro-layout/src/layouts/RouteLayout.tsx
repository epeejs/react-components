import React from 'react';
import BlankLayout from './BlankLayout';
import type { RouteConfig } from '../type';

export const RouteContext = React.createContext<RouteConfig[]>([]);

interface RouteLayoutProps {
  routes: RouteConfig[];
}

const RouteLayout: React.FC<RouteLayoutProps> = ({ routes }) => {
  return (
    <RouteContext.Provider value={routes}>
      <BlankLayout routes={routes} />
    </RouteContext.Provider>
  );
};

export default RouteLayout;
