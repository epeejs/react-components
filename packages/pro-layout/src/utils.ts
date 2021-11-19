import isEmpty from 'lodash/isEmpty';
import type { RouteConfig } from './type';

/**
 * 切割路径
 *
 * @example 入参 '/a/b' ,返回 ['/','/a','/a/b']
 * @param pathname 路径
 * @returns 匹配的路径
 */
export function getMatchPaths(pathname: string): string[] {
  const paths = pathname.split('/');
  return paths.map((__, index) => (index === 0 ? '/' : paths.slice(0, index + 1).join('/')));
}

/**
 * 查找该路径的路由配置
 *
 * @param routes 路由配置
 * @param path 路径
 */
export function getRouteConfigByPath(routes: RouteConfig[], path: string): RouteConfig | undefined {
  // eslint-disable-next-line no-restricted-syntax
  for (const route of routes) {
    if (route.path === path) {
      return route;
    }
    if (!isEmpty(route.routes)) {
      const node = getRouteConfigByPath(route.routes!, path);

      if (node) {
        return node;
      }
    }
  }
}

/**
 * 获取路由配置树的第一个叶节点
 *
 * @param routes 路由配置
 */
export function getFirstLeafNode(routes: RouteConfig[]): RouteConfig | undefined {
  const firstNode = routes[0];

  // 不存在节点时，则返回 undefined
  if (!firstNode) {
    return firstNode;
  }
  if (isEmpty(firstNode.routes)) {
    return firstNode;
  }
  return getFirstLeafNode(firstNode.routes!);
}

/**
 * 根据匹配路径查找所有对应路由配置
 *
 * @param routes 当前查找路由配置
 * @param searchPaths 搜索路径
 * @param currIndex 当前查找下标
 * @param result 结果集
 * @returns result
 */
export function getRouteNode(
  routes: RouteConfig[],
  searchPaths: string[],
  currIndex = 0,
  result: RouteConfig[] = [],
): RouteConfig[] {
  const path = searchPaths[currIndex];
  const route = routes.find((m) => m.path === path);

  if (!route || !path) {
    return result;
  }
  result.push(route);
  if (isEmpty(route.routes)) {
    return result;
  }

  return getRouteNode(route.routes!, searchPaths, currIndex + 1, result);
}

/** 获取路径划分的所有路由配置 */
export function getMatchedRoutesByPath(routes: RouteConfig[], path: string): RouteConfig[] {
  const searchPaths = getMatchPaths(path);

  return getRouteNode(routes, searchPaths);
}
