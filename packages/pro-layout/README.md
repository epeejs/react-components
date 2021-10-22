# pro-layout

ProLayout 提供标准但灵活的中后端布局，具有路由权限及自动菜单生成功能，它可以与 PageContainer 一起使用来自动生成面包屑、页眉等，并提供访问路由配置的低成本解决方案

## peerDependencies

- antd
- react-router-dom

## 安装

```sh
yarn add @epeejs/pro-layout
```

## 使用

```tsx
import { BlankLayout, RouteLayout } from '@epeejs/pro-layout';
import type { RouteConfig } from '@epeejs/pro-layout/es/type';

const routes: RouteConfig[] = [
  { path: '/login', name: '登录', component: Login },
  {
    path: '/',
    component: BlankLayout,
    routes: [
      {
        path: '/form',
        name: '表单页',
        icon: FormOutlined,
        routes: [{ path: '/form/basic-form', name: '基础表单', component: BasicForm }],
      },
    ],
  },
];

ReactDOM.render(
  <Router>
    <RouteLayout routes={routes} />
  </Router>,
  document.getElementById('root'),
);
```

## 路由配置

```ts
interface RouteConfig {
  path: string;
  name?: string;
  icon?: React.ElementType;
  /** 重定向不能与组件同时使用，同时使用时会忽略组件 */
  redirect?: string;
  /** 在菜单中不展示这个路由，包括子路由，菜单不显示条件 hideInMenu || redirect || !name || !checkAuth */
  hideInMenu?: boolean;
  /** 在菜单中只展示该路由，不展示子路由  */
  hideChildrenInMenu?: boolean;
  /** 当前路由是否展示展示顶栏 */
  headerRender?: boolean;
  /** 当前路由是否展示展示页脚 */
  footerRender?: boolean;
  /** 当前路由是否展示展示侧边栏 */
  siderRender?: boolean;
  component?: React.ElementType;
  /** 设置跳转页面方式，将把 path 当作外链处理 */
  target?: OpenPageType;
  routes?: RouteConfig[];
  /** 预留自定义属性 */
  meta?: Meta;
}

type Meta = Record<string, any> & {
  /** 模块 code */
  funcCode?: string;
  /** 功能点 code */
  code?: string;
};
type OpenPageType = '_self' | '_blank';
```

更完整的使用例子可以使用或参考 [epee-react-admin](https://github.com/dobble11/epee-react-admin)

权限控制例子参考 [PageLayout](https://github.com/dobble11/epee-react-admin/blob/master/src/layouts/PageLayout.tsx)

## 路由组件

`RouteConfig.component` 都是路由组件，将会接收到以下 props

```tsx
import type { RouteComponentProps } from 'react-router-dom';

interface LRouteComponentProps extends RouteComponentProps {
  /** 当前路由配置 */
  currentRoute: RouteConfig;
  /** 该路由组件的子路由 */
  routes?: RouteConfig[];
  /** 叶节点路由组件的父级才会有值 */
  children?: React.ReactNode;
}
```

每个路由组件都需要负责控制子路由组件的渲染，如果未处理 `routes` 属性，将导致子路由无法显示，也可以使用通用展开组件 `BlankLayout`

## API

### 组件

- BlankLayout：通用空白布局组件，用于展开子路由
- RouteLayout：根路由布局组件，接收路由配置，并提供路由上下文
- BasicLayout：提供页面基本结构及路由权限控制等
- PageContainer：自动根据路由树生成面包屑，页眉等
- PageLoading: 页面加载中组件

### Hook

```ts
/** 获取当前路径划分的所有路由配置 */
const useMatchedRoutes: () => RouteConfig[];

/**
 * 获取路由元数据
 *
 * @param inherit 是否继承，默认 `true`（将继承路径划分的所有路由配置元数据）
 */
const useRouteMeta: (inherit?: boolean) => Partial<Meta>;
```

### 函数

```ts
/**
 * 切割路径
 *
 * @example 入参 '/a/b' ,返回 ['/','/a','/a/b']
 * @param pathname 路径
 * @returns 匹配的路径
 */
function getMatchPaths(pathname: string): string[];

/**
 * 查找该路径的路由配置
 *
 * @param routes 路由配置
 * @param path 路径
 */
function getRouteConfigByPath(routes: RouteConfig[], path: string): RouteConfig | undefined;

/**
 * 获取路由配置树的第一个叶节点
 *
 * @param routes 路由配置
 */
function getFirstLeafNode(routes: RouteConfig[]): RouteConfig | undefined;

/**
 * 根据匹配路径查找所有对应路由配置
 *
 * @param routes 当前查找路由配置
 * @param searchPaths 搜索路径
 * @param currIndex 当前查找下标
 * @param result 结果集
 * @returns result
 */
function getRouteNode(
  routes: RouteConfig[],
  searchPaths: string[],
  currIndex?: number,
  result?: RouteConfig[],
): RouteConfig[];

/** 获取路径划分的所有路由配置 */
function getMatchedRoutesByPath(routes: RouteConfig[], path: string): RouteConfig[];
```
