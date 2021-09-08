import type { UploadProps } from 'antd';
import { Modal } from 'antd';
import type { RcFile } from 'antd/es/upload';
import React, { useCallback, useRef, useState } from 'react';
import type { CropperProps } from 'react-easy-crop';
import type { Area } from 'react-easy-crop/types';
import type { EasyCropProps } from './EasyCrop';
import EasyCrop, { INIT_ROTATE, pkg } from './EasyCrop';
import './index.less';

export interface ImgCropProps {
  aspect?: number;
  shape?: EasyCropProps['shape'];
  grid?: boolean;
  quality?: number;
  fillColor?: string;
  zoom?: boolean;
  rotate?: boolean;
  minZoom?: number;
  maxZoom?: number;
  modalTitle?: string;
  modalWidth?: number | string;
  modalOk?: string;
  modalCancel?: string;
  onModalOk?: (file: RcFile) => void;
  onModalCancel?: () => void;
  beforeCrop?: (file: RcFile, fileList: RcFile[]) => boolean;
  onUploadFail?: (err: Error) => void;
  cropperProps?: Partial<CropperProps>;
  children?: React.ReactNode;
}

const ImgCropInner: React.ForwardRefRenderFunction<any, ImgCropProps> = (
  {
    aspect = 1,
    shape = 'rect',
    grid = false,
    quality = 0.8,
    zoom = true,
    rotate = true,
    minZoom = 1,
    maxZoom = 3,
    fillColor = 'white',
    modalTitle = '编辑图片',
    modalWidth,
    modalOk,
    modalCancel,
    onModalOk,
    onModalCancel,
    beforeCrop,
    onUploadFail,
    cropperProps,
    children,
  },
  ref,
) => {
  const [image, setImage] = useState('');
  const fileRef = useRef<RcFile>();
  const resolveRef = useRef<any>();
  const rejectRef = useRef<any>();
  const beforeUploadRef = useRef<UploadProps['beforeUpload']>();

  const getUpload = useCallback(() => {
    const upload = (Array.isArray(children) ? children[0] : children) as React.ReactElement;
    const { beforeUpload, accept, ...restUploadProps } = upload.props;
    beforeUploadRef.current = beforeUpload;

    return {
      ...upload,
      props: {
        ...restUploadProps,
        accept: accept || 'image/*',
        beforeUpload: (file: RcFile, fileList: RcFile[]) => {
          return new Promise((resolve, reject) => {
            const crop = beforeCrop?.(file, fileList) ?? true;

            if (!crop) {
              return resolve(beforeUpload?.(file, fileList) ?? true);
            }

            fileRef.current = file;
            resolveRef.current = (newFile: RcFile) => {
              onModalOk?.(newFile);
              resolve(newFile);
            };
            rejectRef.current = (uploadErr: any) => {
              onUploadFail?.(uploadErr);
              reject(uploadErr);
            };

            const reader = new FileReader();
            reader.addEventListener('load', () => setImage(reader.result as string));
            reader.readAsDataURL(file);
          });
        },
      },
    };
  }, [beforeCrop, children, onModalOk, onUploadFail]);

  /**
   * Crop
   */
  const rotateValRef = useRef<number>();
  const cropPixelsRef = useRef<Area>();
  const actionRef = useRef<any>();

  const onClose = () => {
    setImage('');
    actionRef.current.reset();
  };

  const onCancel = () => {
    onModalCancel?.();
    onClose();
  };

  const onOk = () => {
    onClose();

    const rawImg = document.querySelector<HTMLImageElement>(`.${pkg}-media`)!;
    let { width: cropWidth, height: cropHeight, x: cropX, y: cropY } = cropPixelsRef.current!;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    if (rotate && rotateValRef.current !== INIT_ROTATE) {
      // make canvas to cover the rotated image
      const { naturalWidth: rawWidth, naturalHeight: rawHeight } = rawImg;

      let boxSize = Math.sqrt(rawWidth ** 2 + rawHeight ** 2);
      let imgWidth = rawWidth;
      let imgHeight = rawHeight;

      // fit the long image
      if (boxSize > 4096) {
        const ratio = 4096 / boxSize;

        boxSize = 4096;
        imgWidth = rawWidth * ratio;
        imgHeight = rawHeight * ratio;

        cropWidth *= ratio;
        cropHeight *= ratio;
        cropX *= ratio;
        cropY *= ratio;
      }

      canvas.width = boxSize;
      canvas.height = boxSize;

      // rotate image
      const half = boxSize / 2;
      ctx.translate(half, half);
      ctx.rotate((Math.PI / 180) * rotateValRef.current!);
      ctx.translate(-half, -half);

      // draw rotated image to canvas center
      ctx.fillStyle = fillColor;
      ctx.fillRect(0, 0, boxSize, boxSize);

      const imgX = (boxSize - imgWidth) / 2;
      const imgY = (boxSize - imgHeight) / 2;

      ctx.drawImage(rawImg, 0, 0, rawWidth, rawHeight, imgX, imgY, imgWidth, imgHeight);
      const rotatedImg = ctx.getImageData(0, 0, boxSize, boxSize);

      // resize canvas to crop size
      canvas.width = cropWidth;
      canvas.height = cropHeight;

      ctx.fillStyle = fillColor;
      ctx.fillRect(0, 0, cropWidth, cropHeight);
      ctx.putImageData(rotatedImg, -(imgX + cropX), -(imgY + cropY));
    } else {
      canvas.width = cropWidth;
      canvas.height = cropHeight;

      ctx.fillStyle = fillColor;
      ctx.fillRect(0, 0, cropWidth, cropHeight);
      ctx.drawImage(rawImg, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    }

    // get the new image
    const { type, name, uid } = fileRef.current!;
    const onBlob = async (blob: Blob | null) => {
      let newFile = new File([blob!], name, { type }) as RcFile;
      newFile.uid = uid;

      if (typeof beforeUploadRef.current !== 'function') {
        return resolveRef.current(newFile);
      }

      const res = beforeUploadRef.current(newFile, [newFile]);

      if (typeof res !== 'boolean' && !res) {
        console.error('beforeUpload must return a boolean or Promise');
        return;
      }

      if (res === true) return resolveRef.current(newFile);
      if (res === false) return rejectRef.current('not upload');
      if (res && res instanceof Promise) {
        try {
          const passedFile = await res;
          const returnType = Object.prototype.toString.call(passedFile);
          if (returnType === '[object File]' || returnType === '[object Blob]')
            newFile = passedFile as RcFile;
          resolveRef.current(newFile);
        } catch (err) {
          rejectRef.current(err);
        }
      }
    };
    canvas.toBlob(onBlob, type, quality);
  };

  return (
    <>
      {getUpload()}
      {image && (
        <Modal
          visible={true}
          wrapClassName={`${pkg}-modal`}
          title={modalTitle}
          onOk={onOk}
          onCancel={onCancel}
          maskClosable={false}
          destroyOnClose
          width={modalWidth}
          cancelText={modalCancel}
          okText={modalOk}
        >
          <EasyCrop
            ref={ref}
            image={image}
            aspect={aspect}
            shape={shape}
            grid={grid}
            zoom={zoom}
            rotate={rotate}
            rotateValRef={rotateValRef}
            actionRef={actionRef}
            minZoom={minZoom}
            maxZoom={maxZoom}
            cropperProps={cropperProps}
            onCropComplete={(croppedArea, croppedAreaPixels) => {
              cropPixelsRef.current = croppedAreaPixels;
            }}
          />
        </Modal>
      )}
    </>
  );
};

const ImgCrop = React.forwardRef(ImgCropInner);

export default ImgCrop;
