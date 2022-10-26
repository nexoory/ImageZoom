import { CSSProperties } from "react";

export type TUseScrollScale = (
  params?: IUseScrollScaleParams,
) => IUseScrollScaleResult;

export interface IUseScrollScaleParams {
  ref?: TRef;
  catcherRef?: TRef;
  scale?: number;
  onChange?: TOnChange;
  disabled?: boolean;
  speed?: number;

  scaleBounds?: IScaleBounds;
  elementBounds?: TElementBounds;
  pixelsBounds?: IPixelsBounds;
}

export type TElementBounds = "parent" | "document" | HTMLElement;
export interface IPixelsBounds {
  minHeight?: number;
  minWidth?: number;
  maxHeight?: number;
  maxWidth?: number;
}
export interface IScaleBounds {
  min?: number;
  max?: number;
}

export type TScaleBounds = [TScaleBound, TScaleBound];
export type TScaleBound = number | null;

export interface IUseScrollScaleResult {
  scale: number;
  style: CSSProperties;
  width?: number;
  height?: number;
  updateOriginalSize: TUpdateOriginalSize;
  originalSize: TOriginalSizeState;
  manualSetScale: (scale: number) => void;
  maxScale: number;
  minScale: number;
}

export type TOnChange = (
  event: TChangeEvent,
  data: IOnChangeCallbackData,
) => boolean | void;

export type TChangeEvent = WheelEvent | TouchEvent | null;
export interface IOnChangeCallbackData {
  scale: number;
  height: number;
  width: number;
  prevHeight: number;
  prevWidth: number;
  position: IPosition;
}

export interface IPosition {
  x: number;
  y: number;
}

export type TRef = HTMLElement | null;

export type TSizeElement = number | undefined;
export type TSize = [TSizeElement, TSizeElement];

export type TUpdateOriginalSize = (size?: IOriginalSize) => void;

export interface IOriginalSize {
  width: TSizeElement;
  height: TSizeElement;
}

export type TOriginalSizeState = Partial<IOriginalSize>;

export type TOnWheel = (e: WheelEvent) => void;
export type TOnTouch = (e: TouchEvent) => void;

export type TSetScale = (
  event: TChangeEvent,
  delta: number | null,
  position: IPosition | null,
  scale?: number,
) => void;
