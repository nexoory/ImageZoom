import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { clamp } from "helpers";

import {
  TOnTouch,
  TOnWheel,
  TOriginalSizeState,
  TSetScale,
  TUpdateOriginalSize,
  TUseScrollScale,
} from "./types";

import {
  getBoundsByElement,
  getBoundsByPixels,
  getBoundsByPriority,
  getPinchDistance,
} from "./helpers";

const TOUCH_MULTIPLIER = 4;

const useScrollScale: TUseScrollScale = (params = {}) => {
  const {
    catcherRef,
    disabled,
    elementBounds,
    onChange,
    pixelsBounds,
    ref,
    scale: scaleProp,
    scaleBounds = {},
    speed = 1,
  } = params;

  const [scaleState, setScaleState] = useState(1);

  const isManualControl = typeof scaleProp === "number";
  const scale = isManualControl ? scaleProp : scaleState;

  const [originalSize, setOriginalSize] = useState<TOriginalSizeState>({});

  const { height: originalHeight, width: originalWidth } = originalSize;

  const updateOriginalSize: TUpdateOriginalSize = useCallback(
    size => {
      if (size) {
        setOriginalSize(size);
        return;
      }

      if (ref) {
        const { height, width } = ref.getBoundingClientRect();

        setOriginalSize({ height: height / scale, width: width / scale });
      }
    },
    [ref],
  );

  useEffect(() => updateOriginalSize(), [updateOriginalSize]);

  const isOriginalSizeDefined =
    typeof originalHeight === "number" && typeof originalWidth === "number";

  const width = isOriginalSizeDefined ? originalWidth * scale : null;
  const height = isOriginalSizeDefined ? originalHeight * scale : null;

  const style: CSSProperties = isOriginalSizeDefined
    ? {
        height: `${height}px`,
        width: `${width}px`,
      }
    : {};

  const { max = null, min = null } = scaleBounds;

  const [elementMin, elementMax] = getBoundsByElement(
    ref,
    originalWidth,
    originalHeight,
    elementBounds,
  );

  const [pixelsMin, pixelsMax] = useMemo(
    () => getBoundsByPixels(ref, originalWidth, originalHeight, pixelsBounds),
    [ref, originalWidth, originalHeight, pixelsBounds],
  );

  const [minScale, maxScale] = useMemo(
    () =>
      getBoundsByPriority(
        [pixelsMin, pixelsMax],
        [elementMin, elementMax],
        [min, max],
      ),
    [min, max, pixelsMin, pixelsMax, elementMin, elementMax],
  );

  const setScale: TSetScale = useCallback(
    (event = null, delta, position, manualScale) => {
      const newScale = clamp(
        manualScale ?? scale - delta / (100 / speed),
        minScale,
        maxScale,
      );

      if (Number.isNaN(newScale)) return;

      const newHeight = originalHeight * newScale;
      const newWidth = originalWidth * newScale;

      const relativePosition = position
        ? {
            x: position.x / width,
            y: position.y / height,
          }
        : { x: 0.5, y: 0.5 };

      const onChangeResult = onChange?.(event, {
        height: newHeight,
        position: relativePosition,
        prevHeight: height,
        prevWidth: width,
        scale: newScale,
        width: newWidth,
      });

      const canWeContinue =
        typeof onChangeResult === "boolean" ? onChangeResult : true;

      if (!canWeContinue) return;

      !isManualControl && setScaleState(newScale);
    },
    [
      isManualControl,
      onChange,
      scale,
      speed,
      height,
      width,
      originalHeight,
      minScale,
      maxScale,
      originalWidth,
    ],
  );

  const onWheel: TOnWheel = useCallback(
    e => {
      e.preventDefault();

      if (disabled) return;

      const delta = e.deltaY;

      const { left, top } = ref.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;

      setScale(e, delta, { x, y });
    },

    [setScale, disabled, ref],
  );

  const touchStartPosition = useRef<number>();

  const onTouchStart: TOnTouch = useCallback(e => {
    if (e.touches.length === 2) {
      e.preventDefault();
      touchStartPosition.current = getPinchDistance(e);
    }
  }, []);

  const onTouchMove: TOnTouch = useCallback(
    e => {
      if (e.touches.length === 2) {
        e.preventDefault();

        if (disabled) return;

        const { left, top } = ref.getBoundingClientRect();

        const clientX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const clientY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

        const x = clientX - left;
        const y = clientY - top;

        const distance = touchStartPosition.current;

        const currentDistance = getPinchDistance(e);
        const distanceDelta = currentDistance / distance;
        const delta = distanceDelta * (currentDistance <= distance ? 1 : -1);

        touchStartPosition.current = currentDistance;

        if (currentDistance !== distance && distanceDelta > 0.5)
          setScale(e, delta * TOUCH_MULTIPLIER, { x, y });
      }
    },
    [setScale, disabled, ref],
  );

  useEffect(() => {
    const target = catcherRef || ref;

    if (target) {
      target.addEventListener("wheel", onWheel);
      target.addEventListener("touchstart", onTouchStart);
      target.addEventListener("touchmove", onTouchMove);
    }

    return () => {
      if (target) {
        target.removeEventListener("wheel", onWheel);
        target.removeEventListener("touchstart", onTouchStart);
        target.removeEventListener("touchmove", onTouchMove);
      }
    };
  }, [ref, catcherRef, onWheel, onTouchMove, onTouchStart]);

  const manualSetScale = useCallback(
    (scale: number) => setScale(null, null, null, scale),
    [setScale],
  );

  return {
    height,
    manualSetScale,
    maxScale,
    minScale,
    originalSize,
    scale,
    style,
    updateOriginalSize,
    width,
  };
};

export default useScrollScale;
