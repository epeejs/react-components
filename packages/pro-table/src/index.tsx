import type { QueryFilterProps } from '@ant-design/pro-form';
import { QueryFilter } from '@ant-design/pro-form';
import { useAntdTable } from 'ahooks';
import type {
  CombineService,
  PaginatedFormatReturn,
  PaginatedParams,
} from 'ahooks/lib/useAntdTable';
import type { CardProps } from 'antd';
import { Card, Form, Space, Table } from 'antd';
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
  request?: CombineService<PaginatedFormatReturn<any>, PaginatedParams>;
  columns?: ColumnsType<any>;
  title?: string;
  toolbar?: React.ReactNode;
  initialFilter?: Record<string, any>;
  actionRef?: React.MutableRefObject<ActionType | undefined>;
  rowKey?: string;
  tableCardProps?: CardProps;
  queryCardProps?: CardProps;
  queryFilterProps?: QueryFilterProps;
}

const defaultRequest: ProTableProps['request'] = () => Promise.resolve({});

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
}) => {
  const [form] = Form.useForm();
  const {
    tableProps,
    search: { submit },
    refresh,
  } = useAntdTable(request, {
    form: children ? form : undefined,
  });

  useImperativeHandle(actionRef, () => ({ refresh, submit }), [refresh, submit]);

  return (
    <Space
      className={classNames(['ep-pro-table', className])}
      style={style}
      direction="vertical"
      size="middle"
    >
      {children && (
        <Card {...queryCardProps}>
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

      <Card {...tableCardProps}>
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
