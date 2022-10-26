import { IPixelsBounds, TElementBounds, TRef, TScaleBounds } from "./types";

export const getPinchDistance = (e: TouchEvent): number => {
  return Math.hypot(
    e.touches[0].pageX - e.touches[1].pageX,
    e.touches[0].pageY - e.touches[1].pageY,
  );
};

export const getBoundsByElement = (
  element: TRef,
  width: number,
  height: number,
  bound: TElementBounds,
): TScaleBounds => {
  if (!element || !bound || !width || !height) return [null, null];

  const target =
    bound === "document"
      ? document.documentElement
      : bound === "parent"
      ? element.parentElement
      : bound;

  const {
    height: tHeight,
    left: tLeft,
    top: tTop,
    width: tWidth,
  } = target.getBoundingClientRect();

  const { left: eLeft, top: eTop } = element.getBoundingClientRect();

  const left = eLeft - tLeft;
  const top = eTop - tTop;

  return [0, Math.min((tHeight - top) / height, (tWidth - left) / width)];
};

export const getBoundsByPixels = (
  element: TRef,
  width: number,
  height: number,
  bounds: IPixelsBounds,
): TScaleBounds => {
  if (!element || !width || !height || !bounds) return [null, null];

  const { maxHeight, maxWidth, minHeight, minWidth } = bounds;

  const maxHeightScale = getBoundByPixels(maxHeight, height);
  const maxWidthScale = getBoundByPixels(maxWidth, width);

  const minHeightScale = getBoundByPixels(minHeight, height);
  const minWidthScale = getBoundByPixels(minWidth, width);

  const minScale = getResultScaleByPixels(minHeightScale, minWidthScale);
  const maxScale = getResultScaleByPixels(maxHeightScale, maxWidthScale, true);

  return [minScale, maxScale];
};

export const getBoundByPixels = (
  limitValue: number,
  value: number,
): number | null =>
  typeof limitValue === "number" ? limitValue / value : null;

export const getResultScaleByPixels = (
  width: number | null,
  height: number | null,
  min = false,
) => {
  if (width === null && height === null) return null;
  if (width === null) return height;
  if (height === null) return width;

  return min ? Math.min(width, height) : Math.max(width, height);
};

export const getBoundsByPriority = (
  pixels: TScaleBounds,
  element: TScaleBounds,
  scale: TScaleBounds,
): TScaleBounds => {
  const min = Math.max(pixels[0], element[0], scale[0]);
  const max = Math.min(
    pixels[1] || Infinity,
    element[1] || Infinity,
    scale[1] || Infinity,
  );

  return [min, max || Infinity];
};
