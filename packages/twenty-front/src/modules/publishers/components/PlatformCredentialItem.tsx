import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import {
  Platform,
  PublishablePlatforms,
} from '@/ui/layout/show-page/components/nm/types/Platform';
import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { IconChevronRight } from 'twenty-ui';

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
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

type PlatformCredentialItemProps = {
  platformId: PublishablePlatforms;
  platform: Platform;
  values: Record<string, string>;
  onChange: (fieldName: string, value: string) => void;
};

export const PlatformCredentialItem = ({
  platformId,
  platform,
  values,
  onChange,
}: PlatformCredentialItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Agency,
  });

  const getFieldLabel = (fieldName: string) => {
    const field = objectMetadataItem.fields.find((f) => f.name === fieldName);
    return field?.label || fieldName;
  };

  return (
    <StyledItemContainer>
      <StyledHeader onClick={() => setIsExpanded(!isExpanded)}>
        <StyledLeftContent>
          <PlatformBadge platformId={platformId} variant="small" />
          <StyledPlatformName>{platform.name}</StyledPlatformName>
        </StyledLeftContent>
        <StyledChevron
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <IconChevronRight size={16} />
        </StyledChevron>
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
              {platform.fieldsOnAgency && (
                <StyledInputsContainer>
                  {platform.fieldsOnAgency.map((fieldName) => (
                    <TextInputV2
                      key={fieldName}
                      label={getFieldLabel(fieldName)}
                      value={values[fieldName] || ''}
                      onChange={(value) => onChange(fieldName, value)}
                      fullWidth
                    />
                  ))}
                </StyledInputsContainer>
              )}
            </StyledContentInner>
          </StyledContent>
        )}
      </AnimatePresence>
    </StyledItemContainer>
  );
};
