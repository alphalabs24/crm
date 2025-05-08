import { ReactNode } from 'react';
import styled from '@emotion/styled';
import {
  IconAlertTriangle,
  IconArrowRight,
  IconCheck,
  IconInfoCircle,
  IconX,
} from 'twenty-ui';
import { Link } from 'react-router-dom';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

type AlertProps = {
  type?: AlertType;
  title?: string;
  children: ReactNode;
  className?: string;
  linkTo?: string;
  linkText?: string;
  LinkIcon?: React.ElementType;
};

type AlertStyleProps = {
  type: AlertType;
};

const getAlertColors = (type: AlertType, theme: any) => {
  switch (type) {
    case 'info':
      return {
        background: theme.color.blue10,
        color: theme.color.blue60,
        iconColor: theme.color.blue60,
      };
    case 'success':
      return {
        background: theme.color.green10,
        color: theme.color.green60,
        iconColor: theme.color.green60,
      };
    case 'warning':
      return {
        background: theme.color.yellow10,
        color: theme.color.yellow60,
        iconColor: theme.color.yellow60,
      };
    case 'error':
      return {
        background: theme.color.red10,
        color: theme.color.red60,
        iconColor: theme.color.red60,
      };
    default:
      return {
        background: theme.color.blue10,
        color: theme.color.blue60,
        iconColor: theme.color.blue60,
      };
  }
};

const getAlertIcon = (type: AlertType) => {
  switch (type) {
    case 'info':
      return IconInfoCircle;
    case 'success':
      return IconCheck;
    case 'warning':
      return IconAlertTriangle;
    case 'error':
      return IconX;
    default:
      return IconInfoCircle;
  }
};

const StyledAlertContainer = styled.div<AlertStyleProps>`
  align-items: flex-start;
  background-color: ${({ theme, type }) =>
    getAlertColors(type, theme).background};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme, type }) => getAlertColors(type, theme).color};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(1)};
  line-height: 1.4;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  flex: 1;
`;

const StyledTitle = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledIconContainer = styled.div<AlertStyleProps>`
  display: flex;
  color: ${({ theme, type }) => getAlertColors(type, theme).iconColor};
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100%;
`;

const StyledTitleContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledLink = styled(Link)<AlertStyleProps>`
  align-items: center;
  align-self: flex-end;
  color: ${({ theme, type }) => getAlertColors(type, theme).color};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  gap: ${({ theme }) => theme.spacing(0.5)};
  text-decoration: underline;
  width: fit-content;
`;

export const Alert = ({
  type = 'info',
  title,
  children,
  className,
  linkTo,
  linkText,
  LinkIcon,
}: AlertProps) => {
  const Icon = getAlertIcon(type);

  return (
    <StyledAlertContainer type={type} className={className}>
      <StyledContentContainer>
        <StyledTitleContainer>
          <StyledIconContainer type={type}>
            <Icon size={14} />
          </StyledIconContainer>
          {title && <StyledTitle>{title}</StyledTitle>}
        </StyledTitleContainer>
        <div>{children}</div>
        {linkTo && linkText && (
          <StyledLink to={linkTo} type={type}>
            {linkText}
            {LinkIcon && <LinkIcon size={14} />}
            {!LinkIcon && <IconArrowRight size={14} />}
          </StyledLink>
        )}
      </StyledContentContainer>
    </StyledAlertContainer>
  );
};
