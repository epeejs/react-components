import _ from 'lodash';
import { useContext, useMemo } from 'react';
import { useLocation } from 'react-router';
import { RouteContext } from './layouts/RouteLayout';
import type { Meta } from './type';
import { getMatchedRoutesByPath } from './utils';

/** 获取当前路径划分的所有路由配置 */
export const useMatchedRoutes = () => {
  const routes = useContext(RouteContext);
  const { pathname } = useLocation();

  return useMemo(() => {
    return getMatchedRoutesByPath(routes, pathname);
  }, [pathname, routes]);
};

/**
 * 获取路由元数据
 *
 * @param inherit 是否继承，默认 `true`（将继承路径划分的所有路由配置元数据）
 */
export const useRouteMeta = (inherit = true): Partial<Meta> => {
  const routes = useMatchedRoutes();

  return useMemo(() => {
    if (inherit) {
      return routes.reduce((prev, curr) => {
        if (curr?.meta) {
          return { ...prev, ...curr.meta };
        }
        return prev;
      }, {});
    }
    return _.last(routes)?.meta ?? {};
  }, [inherit, routes]);
};

/**
 * 获取权限控制，需要当前或父级路由配置了 funcCode
 */
