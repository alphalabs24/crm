import styled from '@emotion/styled';
import React from 'react';
import { AnimatedEaseIn } from 'twenty-ui';

type DescriptionProps = React.PropsWithChildren & {
  animate?: boolean;
  noMarginTop?: boolean;
};

const StyledDescription = styled.div<Pick<DescriptionProps, 'noMarginTop'>>`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme, noMarginTop }) =>
    !noMarginTop ? theme.spacing(2) : 0};
`;

export const Description = ({
  children,
  animate = false,
  noMarginTop = false,
}: DescriptionProps) => {
  if (animate) {
    return (
      <StyledDescription noMarginTop={noMarginTop}>
        <AnimatedEaseIn>{children}</AnimatedEaseIn>
      </StyledDescription>
    );
  }

  return (
    <StyledDescription noMarginTop={noMarginTop}>{children}</StyledDescription>
  );
};
