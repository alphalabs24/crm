import styled from '@emotion/styled';
import { ReactNode } from 'react';

// Section Card Components
export const StyledSection = styled.div<{ preserveHeight?: boolean }>`
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: ${({ preserveHeight }) => (preserveHeight ? 'unset' : '1')};
  overflow: hidden;
`;

export const StyledSectionTitle = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
  justify-content: space-between;
`;

export const StyledSectionTitleLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const StyledSectionContent = styled.div`
  background: ${({ theme }) => theme.background.primary};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(4)};
  flex: 1;
`;

// Form Border Container
export const StyledFormBorder = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  width: 100%;
`;

// KPI Card Components
export const StyledKPICard = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(3)};
`;

export const StyledKPILabelContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const StyledKPIIcon = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
`;

export const StyledKPILabel = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

export const StyledKPIValue = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

// Progress Container
export const StyledProgressContainer = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: 0 ${({ theme }) => theme.spacing(4)};
`;

// Chart Container
export const StyledChartContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
`;

// Empty States
export const StyledEmptyState = styled.div`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  justify-content: center;
  min-height: 120px;
  width: 100%;
`;

export const StyledComingSoonText = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
`;

// Loading Container
export const StyledLoadingContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(8)};
  width: 100%;
`;

// Button Container
export const StyledButtonContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

// KPI Card Component (functional)
type KPICardProps = {
  label: string;
  value: string | number | ReactNode;
  icon?: ReactNode;
};

export const KPICard = ({ label, value, icon }: KPICardProps) => (
  <StyledKPICard>
    <StyledKPILabelContainer>
      {icon && <StyledKPIIcon>{icon}</StyledKPIIcon>}
      <StyledKPILabel>{label}</StyledKPILabel>
    </StyledKPILabelContainer>
    {typeof value === 'string' || typeof value === 'number' ? (
      <StyledKPIValue>{value}</StyledKPIValue>
    ) : (
      value
    )}
  </StyledKPICard>
);

// Section Component (functional)
type SectionProps = {
  title: ReactNode;
  icon?: ReactNode;
  preserveHeight?: boolean;
  rightComponent?: ReactNode;
  children: ReactNode;
};

export const Section = ({
  title,
  icon,
  rightComponent,
  preserveHeight = false,
  children,
}: SectionProps) => (
  <StyledSection preserveHeight={preserveHeight}>
    <StyledSectionTitle>
      <StyledSectionTitleLeft>
        {icon}
        {title}
      </StyledSectionTitleLeft>
      {rightComponent}
    </StyledSectionTitle>
    <StyledSectionContent>{children}</StyledSectionContent>
  </StyledSection>
);
