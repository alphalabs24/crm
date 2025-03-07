import { cloneElement, PropsWithChildren } from 'react';

export const OptionalWrap = ({
  children,
  condition,
  With,
}: {
  condition: boolean;
  With: React.ReactElement;
} & PropsWithChildren) => {
  if (condition) {
    return cloneElement(With, {
      children,
    });
  }
  return children;
};
