# antd-img-crop

图片裁切工具，用于 Ant Design [Upload](https://ant.design/components/upload-cn/) 组件。

fork from [nanxiaobei/antd-img-crop](https://github.com/nanxiaobei/antd-img-crop)

进行了如下改动

- beforeCrop：返回 `false` 时，仍然会进行文件上传
- quality：图片质量默认值修改为 `0.8`
- 不需要单独导入样式文件（已经按需加载）
- 使用 ts 编写

beforeCrop 改动可以支持例如对 gif 图片不裁剪等功能

```tsx
<ImgCrop beforeCrop={(file) => !file.type.includes('gif')}>
  <Upload />
</ImgCrop>
```

`antd-img-crop` 是返回 `false` 则不裁剪，也不会继续上传，如果需要实现原有功能，使用 antd Upload 组件的 `beforeUpload` 函数

## 安装

```sh
yarn add @epeejs/antd-img-crop
```

## 使用

```jsx harmony
import ImgCrop from '@epeejs/antd-img-crop';
import { Upload } from 'antd';

const Demo = () => (
  <ImgCrop>
    <Upload>+ Add image</Upload>
  </ImgCrop>
);
```

## Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| aspect | `number` | `1 / 1` | 裁切区域宽高比，`width / height` |
| shape | `string` | `'rect'` | 裁切区域形状，`'rect'` 或 `'round'` |
| grid | `boolean` | `false` | 显示裁切区域网格（九宫格） |
| quality | `number` | `0.8` | 图片质量，`0 ~ 1` |
| fillColor | `string` | `'white'` | 裁切图像小于画布时的填充颜色 |
| zoom | `boolean` | `true` | 启用图片缩放 |
| rotate | `boolean` | `false` | 启用图片旋转 |
| minZoom | `number` | `1` | 最小缩放倍数 |
| maxZoom | `number` | `3` | 最大缩放倍数 |
| modalTitle | `string` | `'编辑图片'` | 弹窗标题 |
| modalWidth | `number` \| `string` | - | 弹窗宽度，`px` 的数值或百分比 |
| modalOk | `string` | `'确定'` | 弹窗确定按钮文字 |
| modalCancel | `string` | `'取消'` | 弹窗取消按钮文字 |
| onModalOK | `function` | - | 点击弹窗确定回调 |
| onModalCancel | `function` | - | 点击弹窗遮罩层、右上角叉、取消的回调 |
| beforeCrop | `function` | - | 弹窗打开前调用，若返回 `false`，弹框将不会打开，但任然会执行 ant upload 组件的上传 |
| onUploadFail | `function` | - | 上传失败时的回调 |
| cropperProps | `object` | - | [react-easy-crop] 的 props（\* [已有 props] 无法重写） |
