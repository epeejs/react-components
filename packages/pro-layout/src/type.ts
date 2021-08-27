import type { RouteComponentProps } from 'react-router-dom';

export type Meta = Record<string, any> & {
  /** 模块 code */
  funcCode?: string;
  /** 功能点 code */
  code?: string;
};
export type OpenPageType = '_self' | '_blank';

export interface RouteConfig {
  path: string;
  name?: string;
  icon?: React.ElementType;
  /** 重定向不能与组件同时使用，同时使用时会忽略组件 */
  redirect?: string;
  /** 在菜单中不展示这个路由，包括子路由，菜单不显示条件 hideInMenu || redirect || !name || !checkAuth */
  hideInMenu?: boolean;
  /** 在菜单中只展示该路由，不展示子路由  */
  hideChildrenInMenu?: boolean;
  component?: React.ElementType;
  /** 设置跳转页面方式，将把 path 当作外链处理 */
  target?: OpenPageType;
  routes?: RouteConfig[];
  /** 预留自定义属性 */
  meta?: Meta;
}

export interface LRouteComponentProps extends RouteComponentProps {
  /** 当前路由配置 */
  currentRoute: RouteConfig;
  /** 该路由组件的子路由 */
  routes?: RouteConfig[];
  /** 叶节点路由组件的父级才会有值 */
  children?: React.ReactNode;
}
