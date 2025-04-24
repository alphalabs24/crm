import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconChevronDown, IconCheck, MOBILE_VIEWPORT } from 'twenty-ui';

// Field Card Components
export const StyledFieldCard = styled.div<{ isSelected: boolean }>`
  align-items: center;
  background: ${({ theme, isSelected }) =>
    isSelected ? theme.background.tertiary : theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(1.5)};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
    border-color: ${({ theme }) => theme.border.color.medium};
  }
`;

export const StyledFieldLabelContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

export const StyledFieldLabel = styled.span<{ isSelected: boolean }>`
  color: ${({ theme, isSelected }) =>
    isSelected ? theme.font.color.primary : theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

export const StyledFieldsGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

export const StyledSelectionOrder = styled.div`
  align-items: center;
  border-radius: 50%;
  color: ${({ theme }) => theme.color.blue};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
`;

// Option Card Components
export const StyledOptionCard = styled.div<{ isSelected?: boolean }>`
  align-items: center;
  background: ${({ theme, isSelected }) =>
    isSelected ? theme.background.tertiary : theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

export const StyledOptionCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const StyledOptionContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const StyledOptionDescription = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
`;

export const StyledOptionIcon = styled.div<{ isSelected?: boolean }>`
  color: ${({ theme, isSelected }) =>
    isSelected ? theme.color.blue : theme.font.color.secondary};
  display: flex;
`;

export const StyledOptionLabel = styled.span<{ isSelected?: boolean }>`
  color: ${({ theme, isSelected }) =>
    isSelected ? theme.font.color.primary : theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

export const StyledOptionCardContent = styled.div<{ $disabled?: boolean }>`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
`;

export const StyledOptionIconContainer = styled.div`
  display: flex;
`;

export const StyledOptionsInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

export const StyledOptionTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

export const StyledCheckIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Layout Components
export const StyledOptionsGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

export const StyledOptionsPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  overflow-y: auto;
  padding-right: ${({ theme }) => theme.spacing(2)};
  flex: 0.3;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
    padding-right: 0;
  }
`;

export const StyledPreviewContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  flex: 1;
  height: 500px;
  overflow: hidden;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    height: 400px;
  }
`;

export const StyledPreviewPanel = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
  }
`;

export const StyledModalLayout = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(4)};
  flex: 1;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
  }
`;

// Section Components
export const StyledSectionDivider = styled.div`
  background-color: ${({ theme }) => theme.border.color.light};
  height: 1px;
  margin: ${({ theme }) => theme.spacing(3)} 0;
  width: 100%;
`;

export const StyledSectionHeader = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  justify-content: space-between;
  margin: 0 0 ${({ theme }) => theme.spacing(2)};
  user-select: none;
`;

export const StyledSectionContent = styled(motion.div)`
  overflow: hidden;
`;

export const StyledChevron = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StyledSectionTitle = styled.h4`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin: 0 0 ${({ theme }) => theme.spacing(2)};
`;

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const CollapsibleSection = ({
  title,
  children,
  defaultOpen = true,
}: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isHovering, setIsHovering] = useState(false);
  const theme = useTheme();
  const { t } = useLingui();

  return (
    <>
      <StyledSectionHeader
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {title}
        {(isHovering || !isOpen) && (
          <StyledChevron
            animate={{ rotate: isOpen ? 0 : -90, opacity: 1 }}
            transition={{ duration: 0.2 }}
            initial={{ opacity: 0 }}
          >
            <IconChevronDown size={18} color={theme.font.color.secondary} />
          </StyledChevron>
        )}
      </StyledSectionHeader>
      <AnimatePresence initial={false}>
        {isOpen && (
          <StyledSectionContent
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </StyledSectionContent>
        )}
      </AnimatePresence>
    </>
  );
};

// Optional: Helper components for rendering publisher options
type PublisherOptionProps = {
  isSelected: boolean;
  isAvailable: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  enabledDescription: string;
  disabledDescription: string;
  unavailableDescription: string;
};

export const PublisherOption = ({
  isSelected,
  isAvailable,
  onClick,
  icon,
  title,
  enabledDescription,
  disabledDescription,
  unavailableDescription,
}: PublisherOptionProps) => {
  const theme = useTheme();

  return (
    <StyledOptionCard
      isSelected={isSelected}
      onClick={() => (isAvailable ? onClick() : null)}
      style={{
        opacity: isAvailable ? 1 : 0.5,
        cursor: isAvailable ? 'pointer' : 'not-allowed',
      }}
    >
      <StyledOptionIcon isSelected={isSelected && isAvailable}>
        {icon}
      </StyledOptionIcon>
      <StyledOptionContent>
        <StyledOptionLabel isSelected={isSelected && isAvailable}>
          {title}
        </StyledOptionLabel>
        <StyledOptionDescription>
          {!isAvailable
            ? unavailableDescription
            : isSelected
              ? enabledDescription
              : disabledDescription}
        </StyledOptionDescription>
      </StyledOptionContent>
      {isSelected && isAvailable && <IconCheck size={16} color="blue" />}
    </StyledOptionCard>
  );
};
