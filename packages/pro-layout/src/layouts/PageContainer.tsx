import type { PageHeaderProps, TabPaneProps, TabsProps } from 'antd';
import { Breadcrumb, PageHeader, Space, Spin, Tabs } from 'antd';
import classNames from 'classnames';
import last from 'lodash/last';
import React from 'react';
import { Link } from 'react-router-dom';
import { useMatchedRoutes } from '../hooks';
import './PageContainer.less';

const { TabPane } = Tabs;

export interface BreadCrumbConfig {
  path?: string;
  name: string;
}
export interface PageContainerProps {
  className?: string;
  style?: React.CSSProperties;
  breadCrumbList?: BreadCrumbConfig[];
  loading?: boolean;
  tabActiveKey?: TabsProps['activeKey'];
  tabList?: (TabPaneProps & {
    key?: React.ReactText;
  })[];
  onTabChange?: TabsProps['onChange'];
  tabProps?: TabsProps;
  title?: string;
  headerProps?: PageHeaderProps;
}

const PageContainer: React.FC<PageContainerProps> = ({
  breadCrumbList,
  children,
  loading,
  tabList,
  onTabChange,
  tabActiveKey,
  tabProps,
  title,
  headerProps,
  className,
  style,
}) => {
  const matchedRoutes = useMatchedRoutes();
  const crumbs = breadCrumbList ?? (matchedRoutes.filter((m) => m.name) as BreadCrumbConfig[]);

  if (loading) {
    return <Spin size="large" style={{ width: '100%', paddingTop: '100px' }} />;
  }

  return (
    <Space
      className={classNames(['ep-page-container', className])}
      direction="vertical"
      size="middle"
      style={style}
    >
      <PageHeader
        ghost={false}
        breadcrumb={
          <Breadcrumb>
            {crumbs.map((m, index) => (
              <Breadcrumb.Item key={m.name}>
                {m.path && index > 0 && index < crumbs.length - 1 ? (
                  <Link to={m.path}>{m.name}</Link>
                ) : (
                  m.name
                )}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        }
        title={title ?? last(crumbs)?.name}
        footer={
          tabList && (
            <Tabs activeKey={tabActiveKey} onChange={onTabChange} {...tabProps}>
              {tabList.map((m) => (
                <TabPane key={m.key} {...m} />
              ))}
            </Tabs>
          )
        }
        {...headerProps}
      >
        {headerProps?.content}
      </PageHeader>

      {children}
    </Space>
  );
};

export default PageContainer;
