import type { Service } from '@ahooksjs/use-request/lib/types';
import type { QueryFilterProps } from '@ant-design/pro-form';
import { QueryFilter } from '@ant-design/pro-form';
import { useAntdTable } from 'ahooks';
import type { PaginatedFormatReturn, PaginatedParams } from 'ahooks/lib/useAntdTable';
import type { CardProps } from 'antd';
import { Card, Form, Space, Table } from 'antd';
import type { FormInstance } from 'antd/es/form/Form';
import type { ColumnsType } from 'antd/lib/table';
import classNames from 'classnames';
import React, { useImperativeHandle } from 'react';
import './index.less';

export type ActionType = {
  submit: () => void;
  refresh: () => void;
};
export interface ProTableProps {
  className?: string;
  style?: React.CSSProperties;
  request?: Service<PaginatedFormatReturn<any>, PaginatedParams>;
  columns?: ColumnsType<any>;
  title?: string;
  toolbar?: React.ReactNode;
  initialFilter?: Record<string, any>;
  actionRef?: React.MutableRefObject<ActionType | undefined>;
  rowKey?: string;
  tableCardProps?: CardProps;
  queryCardProps?: CardProps;
  queryFilterProps?: QueryFilterProps;
  noStyle?: boolean;
  extraFilterParams?: Record<string, any>;
  form?: FormInstance;
}

const defaultRequest: ProTableProps['request'] = () => Promise.resolve({ total: 0, list: [] });

const ProTable: React.FC<ProTableProps> = ({
  className,
  style,
  title,
  toolbar,
  request = defaultRequest,
  columns,
  initialFilter,
  actionRef,
  rowKey,
  tableCardProps,
  queryCardProps,
  queryFilterProps,
  children,
  noStyle,
  extraFilterParams,
  form: _form,
}) => {
  const [form] = Form.useForm(_form);
  const tableRequest = extraFilterParams
    ? (pageParams: PaginatedParams[0], formParams: PaginatedParams[1]) =>
        request(pageParams, {
          ...formParams,
          ...extraFilterParams,
        })
    : request;
  const {
    tableProps,
    search: { submit },
    refresh,
  } = useAntdTable(tableRequest, {
    form: children ? form : undefined,
  });
  const cardStyle: CardProps | undefined = noStyle
    ? {
        bordered: false,
        bodyStyle: {
          padding: '0',
        },
      }
    : undefined;

  useImperativeHandle(actionRef, () => ({ refresh, submit }), [refresh, submit]);

  return (
    <Space
      className={classNames(['ep-pro-table', className])}
      style={style}
      direction="vertical"
      size="middle"
    >
      {children && (
        <Card {...queryCardProps} {...cardStyle}>
          <QueryFilter
            form={form}
            onFinish={submit as any}
            onReset={submit}
            initialValues={initialFilter}
            labelCol={{ span: 6 }}
            submitter={{
              submitButtonProps: {
                hidden: true,
              },
            }}
            {...queryFilterProps}
          >
            {children}
          </QueryFilter>
        </Card>
      )}

      <Card {...tableCardProps} {...cardStyle}>
        <div className="ep-pro-table-header">
          <div className="ep-pro-table-header-title">{title}</div>
          <div>{toolbar}</div>
        </div>

        <Table
          rowKey={rowKey ?? 'id'}
          columns={columns}
          {...tableProps}
          pagination={{
            ...tableProps.pagination,
            showTotal: (total) => `共 ${total} 条`,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>
    </Space>
  );
};

export default ProTable;
