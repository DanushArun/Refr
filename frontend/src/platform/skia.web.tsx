import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

type RenderProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

type NoopPath = {
  addArc: () => void;
  addCircle: () => void;
  close: () => void;
  lineTo: () => void;
  moveTo: () => void;
};

export type SkPath = NoopPath;
export type Vector = { x: number; y: number };
export type Transforms3d = unknown[];

function NoopContainer({ children }: RenderProps): React.ReactElement {
  return <>{children}</>;
}

function NoopRender(): null {
  return null;
}

function makePath(): NoopPath {
  return {
    addArc: () => {},
    addCircle: () => {},
    close: () => {},
    lineTo: () => {},
    moveTo: () => {},
  };
}

export function Canvas({ children, style }: RenderProps): React.ReactElement {
  return (
    <View pointerEvents="none" style={style}>
      {children}
    </View>
  );
}

export const BlurMask = NoopRender;
export const Circle = NoopContainer;
export const Fill = NoopContainer;
export const Group = NoopContainer;
export const Line = NoopContainer;
export const LinearGradient = NoopRender;
export const Path = NoopContainer;
export const RadialGradient = NoopRender;
export const Shader = NoopRender;
export const Shadow = NoopRender;

export const Skia = {
  Path: {
    Make: makePath,
  },
  RuntimeEffect: {
    Make: () => null,
  },
};

export function vec(x: number, y: number): Vector {
  return { x, y };
}
