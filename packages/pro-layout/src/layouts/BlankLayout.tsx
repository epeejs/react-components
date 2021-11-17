import isEmpty from 'lodash/isEmpty';
import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import type { RouteConfig } from '../type';

export interface BlankLayoutProps {
  routes: RouteConfig[];
  otherProps?: any;
}

const BlankLayout: React.FC<BlankLayoutProps> = (props) => {
  return (
    <Switch>
      {props.routes.map((m) => {
        const { path, routes, component, redirect } = m;

        return (
          <Route
            key={path}
            path={path}
            render={(routeProps) => {
              if (redirect) {
                return (
                  <Redirect
                    to={{
                      pathname: redirect,
                      search: routeProps.location.search,
                    }}
                  />
                );
              }
              if (component) {
                const childComp = routes?.find(
                  (route) => route.path === routeProps.location.pathname,
                )?.component;

                return React.createElement(
                  component,
                  {
                    ...routeProps,
                    ...props.otherProps,
                    currentRoute: m,
                    routes,
                  },
                  childComp && React.createElement(childComp),
                );
              }
              if (!isEmpty(routes)) {
                return <BlankLayout routes={routes!} />;
              }
            }}
            exact={Boolean(redirect)}
          />
        );
      })}
    </Switch>
  );
};

export default BlankLayout;
