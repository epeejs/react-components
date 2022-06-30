/* eslint-disable no-param-reassign */
import { Layout, Menu } from 'antd';
import isEmpty from 'lodash/isEmpty';
import React, { useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useMatchedRoutes } from '../hooks';
import type { Meta, RouteConfig } from '../type';
import { getFirstLeafNode, getMatchPaths, getRouteConfigByPath } from '../utils';
import BlankLayout from './BlankLayout';

const { Content, Sider } = Layout;
const { SubMenu, Item: MenuItem } = Menu;

const renderMenu = (routes: RouteConfig[]) => {
  return routes.map((m) => {
    if (!isEmpty(m.routes)) {
      return (
        <SubMenu
          key={m.path}
          title={
            <span>
              {m.icon && React.createElement(m.icon)}
              <span>{m.name}</span>
            </span>
          }
        >
          {renderMenu(m.routes!)}
        </SubMenu>
      );
    }

    return (
      <MenuItem key={m.path}>
        {m.icon && React.createElement(m.icon)}
        <span>{m.name}</span>
      </MenuItem>
    );
  });
};

export type CreateAuthorized<AuthorityType = any> = (
  auth: AuthorityType,
) => (component: React.ElementType, meta?: Meta) => React.ElementType;
export type CheckAuth<AuthorityType = any> = (auth: AuthorityType, meta?: Meta) => boolean;

export interface BasicLayoutProps<AuthorityType> {
  routes: RouteConfig[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  authInfo?: AuthorityType;
  siderRender?: (menu: React.ReactNode) => React.ReactNode;
  /** 用于包裹需要权限控制的高阶组件函数 */
  createAuthorized?: CreateAuthorized<AuthorityType>;
  /** 权限检查 */
  checkAuth?: CheckAuth<AuthorityType>;
  contentClassName?: string;
}

const defaultCheckAuth: CheckAuth = () => true;
const defaultAuthInfo: BasicLayoutProps<any>['authInfo'] = {};
const defaultCreateAuthorized: CreateAuthorized = () => (component) => component;

function BasicLayout<AuthorityType = any>({
  routes,
  header,
  footer,
  siderRender,
  authInfo = defaultAuthInfo,
  checkAuth = defaultCheckAuth,
  createAuthorized = defaultCreateAuthorized,
  contentClassName,
}: BasicLayoutProps<AuthorityType>) {
  const history = useHistory();
  const { pathname } = useLocation();
  const paths = getMatchPaths(pathname);
  const openKeys = paths.slice(0, paths.length - 1);
  const matchedRoutes = useMatchedRoutes();
  const layoutConfig = matchedRoutes.reduce(
    (prev, curr) => {
      if (typeof curr.headerRender === 'boolean') {
        prev.headerRender = curr.headerRender;
      }
      if (typeof curr.siderRender === 'boolean') {
        prev.siderRender = curr.siderRender;
      }
      if (typeof curr.footerRender === 'boolean') {
        prev.footerRender = curr.footerRender;
      }
      return prev;
    },
    { siderRender: true, headerRender: true, footerRender: true },
  );
  const menuRoutes = useMemo(() => {
    const filterNode = (nodes: RouteConfig[]): RouteConfig[] => {
      return nodes
        .map((m) => ({ ...m }))
        .filter((m) => {
          if (m.hideInMenu || m.redirect || !m.name || !checkAuth(authInfo, m.meta)) {
            return false;
          }
          if (m.hideChildrenInMenu) {
            m.routes = undefined;
            return true;
          }
          if (!isEmpty(m.routes)) {
            m.routes = filterNode(m.routes!);
            // 子节点为空时，是否隐藏父节点
            return m.routes.length;
          }
          return true;
        });
    };

    return filterNode(routes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authInfo, routes]);
  const authRoutes = useMemo(() => {
    const withAuthorized = createAuthorized(authInfo);
    const wrapNode = (nodes: RouteConfig[]) => {
      return nodes.map((m) => {
        const cloneNode = { ...m };

        if (cloneNode.component) {
          cloneNode.component = withAuthorized(cloneNode.component, cloneNode.meta);
        }
        if (!isEmpty(cloneNode.routes)) {
          cloneNode.routes = wrapNode(cloneNode.routes!);
        }

        return cloneNode;
      });
    };
    const newRoutes = wrapNode(routes);
    const redirectNode = newRoutes.find((m) => m.path === '/' && m.redirect);

    if (redirectNode) {
      const targetRoute = getRouteConfigByPath(menuRoutes, redirectNode.redirect!);
      const firstLeafNode = getFirstLeafNode(menuRoutes);

      // 如果重定向页面无权限访问且第一个叶节点存在，则修改为跳转到第一个叶节点
      if (!targetRoute && firstLeafNode) {
        redirectNode.redirect = firstLeafNode.path;
      }
    }

    return newRoutes;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authInfo, menuRoutes, routes]);
  const getSider = () => {
    const menu = pathname !== '/' && (
      <Menu
        mode="inline"
        defaultOpenKeys={openKeys}
        selectedKeys={paths}
        onClick={(param) => {
          const path = param.key as string;
          const node = getRouteConfigByPath(routes, path)!;

          if (!node.target) {
            history.push(param.key);
          } else {
            window.open(path, node.target);
          }
        }}
      >
        {renderMenu(menuRoutes)}
      </Menu>
    );
    return siderRender ? siderRender(menu) : <Sider>{menu}</Sider>;
  };
  const headerDom = layoutConfig.headerRender ? header : null;
  const siderDom = layoutConfig.siderRender ? getSider() : null;
  const footerDom = layoutConfig.footerRender ? footer : null;

  return (
    <Layout>
      {headerDom}
      <Layout>
        {siderDom}
        <Content className={contentClassName}>
          <BlankLayout routes={authRoutes} />
        </Content>
      </Layout>
      {footerDom}
    </Layout>
  );
}

export default BasicLayout;
