import styled from '@emotion/styled';
import React from 'react';
import { AnimatedEaseIn } from 'twenty-ui';

type TitleProps = React.PropsWithChildren & {
  animate?: boolean;
  noMarginTop?: boolean;
  noMarginBottom?: boolean;
};

const StyledTitle = styled.div<
  Pick<TitleProps, 'noMarginTop' | 'noMarginBottom'>
>`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme, noMarginBottom }) =>
    !noMarginBottom ? theme.spacing(4) : 0};
  margin-top: ${({ theme, noMarginTop }) =>
    !noMarginTop ? theme.spacing(4) : 0};
  text-align: center;
`;

export const Title = ({
  children,
  animate = false,
  noMarginTop = false,
  noMarginBottom = false,
}: TitleProps) => {
  if (animate) {
    return (
      <StyledTitle noMarginTop={noMarginTop} noMarginBottom={noMarginBottom}>
        <AnimatedEaseIn>{children}</AnimatedEaseIn>
      </StyledTitle>
    );
  }

  return <StyledTitle noMarginTop={noMarginTop}>{children}</StyledTitle>;
};
