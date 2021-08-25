import React from 'react';
import { Spin } from 'antd';
import type { SpinProps } from 'antd';

const PageLoading: React.FC<SpinProps> = (props) => (
  <Spin size="large" style={{ width: '100%', paddingTop: 150 }} {...props} />
);

export default PageLoading;
