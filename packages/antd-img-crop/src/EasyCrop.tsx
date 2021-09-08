import { Slider } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import type { CropperProps } from 'react-easy-crop';
import Cropper from 'react-easy-crop';

const ROTATE_STEP = 1;
const MIN_ROTATE = -180;
const MAX_ROTATE = 180;
const INIT_ZOOM = 1;
const ZOOM_STEP = 0.1;
export const INIT_ROTATE = 0;
export const pkg = 'antd-img-crop';

export interface EasyCropProps {
  image?: string;
  aspect: number;
  shape?: CropperProps['cropShape'];
  grid?: boolean;
  zoom?: boolean;
  rotate?: boolean;
  minZoom: number;
  maxZoom: number;
  rotateValRef: React.MutableRefObject<number | undefined>;
  actionRef: React.MutableRefObject<any>;
  cropperProps?: Partial<CropperProps>;
  onCropComplete?: CropperProps['onCropComplete'];
}

const EasyCrop: React.ForwardRefRenderFunction<any, EasyCropProps> = (props, ref) => {
  const {
    image,
    aspect,
    shape,
    grid,
    zoom,
    rotate,
    minZoom,
    maxZoom,
    rotateValRef,
    actionRef,
    cropperProps,
    onCropComplete,
  } = props;
  const [crop, onCropChange] = useState({ x: 0, y: 0 });
  const [cropSize, setCropSize] = useState({ width: 0, height: 0 });
  const onMediaLoaded = useCallback(
    (mediaSize) => {
      const { width, height } = mediaSize;
      const ratioWidth = height * aspect;

      if (width > ratioWidth) {
        setCropSize({ width: ratioWidth, height });
      } else {
        setCropSize({ width, height: width / aspect });
      }
    },
    [aspect],
  );

  const [zoomVal, setZoomVal] = useState(INIT_ZOOM);
  const [rotateVal, setRotateVal] = useState(INIT_ROTATE);
  rotateValRef.current = rotateVal;

  useEffect(() => {
    actionRef.current = {
      reset: () => {
        setZoomVal(INIT_ZOOM);
        setRotateVal(INIT_ROTATE);
      },
    };
  }, [actionRef]);

  return (
    <>
      <Cropper
        {...cropperProps}
        ref={ref}
        image={image}
        crop={crop}
        cropSize={cropSize}
        onCropChange={onCropChange}
        aspect={aspect}
        cropShape={shape}
        showGrid={grid}
        zoomWithScroll={zoom}
        zoom={zoomVal}
        rotation={rotateVal}
        onZoomChange={setZoomVal}
        onRotationChange={setRotateVal}
        minZoom={minZoom}
        maxZoom={maxZoom}
        onCropComplete={onCropComplete}
        onMediaLoaded={onMediaLoaded}
        classes={{ containerClassName: `${pkg}-container`, mediaClassName: `${pkg}-media` }}
      />
      {zoom && (
        <div className={`${pkg}-control zoom`}>
          <button
            onClick={() => setZoomVal(zoomVal - ZOOM_STEP)}
            disabled={zoomVal - ZOOM_STEP < minZoom}
          >
            －
          </button>
          <Slider
            min={minZoom}
            max={maxZoom}
            step={ZOOM_STEP}
            value={zoomVal}
            onChange={setZoomVal}
          />
          <button
            onClick={() => setZoomVal(zoomVal + ZOOM_STEP)}
            disabled={zoomVal + ZOOM_STEP > maxZoom}
          >
            ＋
          </button>
        </div>
      )}
      {rotate && (
        <div className={`${pkg}-control rotate`}>
          <button
            onClick={() => setRotateVal(rotateVal - ROTATE_STEP)}
            disabled={rotateVal === MIN_ROTATE}
          >
            ↺
          </button>
          <Slider
            min={MIN_ROTATE}
            max={MAX_ROTATE}
            step={ROTATE_STEP}
            value={rotateVal}
            onChange={setRotateVal}
          />
          <button
            onClick={() => setRotateVal(rotateVal + ROTATE_STEP)}
            disabled={rotateVal === MAX_ROTATE}
          >
            ↻
          </button>
        </div>
      )}
    </>
  );
};

export default React.forwardRef(EasyCrop);
