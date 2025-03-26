import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import {
  Platform,
  PlatformField,
  PublishablePlatforms,
} from '@/ui/layout/show-page/components/nm/types/Platform';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { IconChevronRight, IconCircleCheck, IconHelpCircle } from 'twenty-ui';

const StyledItemContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  background: ${({ theme }) => theme.background.primary};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  overflow: hidden;
`;

const StyledHeader = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledLeftContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledPlatformName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledContent = styled(motion.div)`
  border-top: 1px solid ${({ theme }) => theme.border.color.medium};
  overflow: hidden;
`;

const StyledContentInner = styled.div`
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledDescription = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledChevron = styled(motion.div)`
  align-items: center;
  display: flex;
`;

const StyledInputsContainer = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
  grid-template-columns: 1fr;

  @media (min-width: 600px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const StyledInputWrapper = styled.div`
  min-width: 200px;
`;

const StyledHelpText = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  gap: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const StyledHelpIcon = styled(IconHelpCircle)`
  color: inherit;
  width: 14px;
  height: 14px;
`;

const StyledComingSoonTag = styled.div`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => `${theme.spacing(0.5)} ${theme.spacing(1)}`};
`;

const StyledComingSoonContent = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  min-height: 60px;
  padding: ${({ theme }) => theme.spacing(4)};
  text-align: center;
`;

const StyledComingSoonTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledHeaderRight = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

type PlatformCredentialItemProps = {
  platformId: PublishablePlatforms;
  platform: Platform;
  values: Record<string, string>;
  onChange: (fieldName: string, value: string) => void;
  onHelpAction?: (action: PlatformField['action']) => void;
};

export const PlatformCredentialItem = ({
  platformId,
  platform,
  values,
  onChange,
  onHelpAction,
}: PlatformCredentialItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Agency,
  });

  const theme = useTheme();

  const hasFields =
    platform.fieldsOnAgency && platform.fieldsOnAgency.length > 0;

  const isFullySetup =
    hasFields &&
    platform.fieldsOnAgency?.every(
      (field) => values[field.name] && values[field.name].trim() !== '',
    );

  const getFieldLabel = (fieldName: string) => {
    const field = objectMetadataItem.fields.find((f) => f.name === fieldName);
    return field?.label || fieldName;
  };

  const handleHelpClick = (field: PlatformField) => {
    if (field.action && onHelpAction) {
      onHelpAction(field.action);
    }
  };

  return (
    <StyledItemContainer>
      <StyledHeader onClick={() => setIsExpanded(!isExpanded)}>
        <StyledLeftContent>
          <PlatformBadge platformId={platformId} size="small" />
          <StyledPlatformName>{platform.name}</StyledPlatformName>
        </StyledLeftContent>
        <StyledHeaderRight>
          {!hasFields && (
            <StyledComingSoonTag>
              <Trans>Coming soon</Trans>
            </StyledComingSoonTag>
          )}
          {isFullySetup && (
            <IconCircleCheck color={theme.color.green} size={16} />
          )}
          <StyledChevron
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <IconChevronRight size={16} />
          </StyledChevron>
        </StyledHeaderRight>
      </StyledHeader>
      <AnimatePresence>
        {isExpanded && (
          <StyledContent
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <StyledContentInner>
              <StyledDescription>{platform.description}</StyledDescription>
              {hasFields ? (
                <StyledInputsContainer>
                  {platform.fieldsOnAgency?.map((field) => (
                    <StyledInputWrapper key={field.name}>
                      <TextInputV2
                        label={getFieldLabel(field.name)}
                        value={values[field.name] || ''}
                        onChange={(value) => onChange(field.name, value)}
                        fullWidth
                        type={field.type}
                      />
                      {field.helpText && (
                        <StyledHelpText
                          onClick={(e) => {
                            e.stopPropagation();
                            handleHelpClick(field);
                          }}
                        >
                          <StyledHelpIcon />
                          {field.helpText}
                        </StyledHelpText>
                      )}
                    </StyledInputWrapper>
                  ))}
                </StyledInputsContainer>
              ) : (
                <StyledComingSoonContent>
                  <div>
                    <StyledComingSoonTitle>
                      <Trans>Integration Coming Soon</Trans>
                    </StyledComingSoonTitle>
                  </div>
                </StyledComingSoonContent>
              )}
            </StyledContentInner>
          </StyledContent>
        )}
      </AnimatePresence>
    </StyledItemContainer>
  );
};
