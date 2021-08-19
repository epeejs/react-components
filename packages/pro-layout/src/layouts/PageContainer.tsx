import type { PageHeaderProps, TabPaneProps, TabsProps } from 'antd';
import { Breadcrumb, PageHeader, Space, Spin, Tabs } from 'antd';
import _ from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';
import { useMatchedRoutes } from '../hooks';

const { TabPane } = Tabs;

export interface BreadCrumbConfig {
  path?: string;
  name: string;
}
interface PageContainerProps {
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
}) => {
  const matchedRoutes = useMatchedRoutes();
  const crumbs = breadCrumbList ?? (matchedRoutes.filter((m) => m.name) as BreadCrumbConfig[]);

  if (loading) {
    return <Spin size="large" style={{ width: '100%', paddingTop: '100px' }} />;
  }

  return (
    <Space direction="vertical" size="middle">
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
        title={title ?? _.last(crumbs)?.name}
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
      />

      {children}
    </Space>
  );
};

export default PageContainer;
