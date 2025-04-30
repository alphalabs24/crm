import { Note } from '@/activities/types/Note';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { IconChevronDown } from 'twenty-ui';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  position: relative;
`;

const StyledDropdownButton = styled.button`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  height: 32px;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

const StyledDropdownList = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  display: flex;
  flex-direction: column;
  max-height: 200px;
  overflow-y: auto;
  width: 100%;
`;

const StyledDropdownItem = styled.button<{ isSelected?: boolean }>`
  align-items: center;
  background: none;
  border: none;
  color: ${({ theme, isSelected }) =>
    isSelected ? theme.color.blue : theme.font.color.primary};
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: flex-start;
  padding: ${({ theme }) => theme.spacing(2)};
  text-align: left;
  width: 100%;

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

const StyledLabel = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledDisclaimer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  gap: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(1)};
  flex-wrap: wrap;
`;

const StyledEditLink = styled(Link)`
  color: ${({ theme }) => theme.font.color.light};
  text-decoration: underline;

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

type EmailTemplateSelectProps = {
  selectedTemplateId?: string | null;
  onSelect: (template: Note | null) => void;
};

export const EmailTemplateSelect = ({
  selectedTemplateId,
  onSelect,
}: EmailTemplateSelectProps) => {
  const { t } = useLingui();
  const dropdownId = 'email-template-select';
  const { closeDropdown } = useDropdown(dropdownId);

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Note,
  });

  const recordGqlFields = useMemo(() => {
    if (!objectMetadataItem) return undefined;
    return generateDepthOneRecordGqlFields({ objectMetadataItem });
  }, [objectMetadataItem]);

  const { records: emailTemplates, loading } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Note,
    filter: { type: { eq: 'EmailTemplate' } },
    recordGqlFields,
    skip: !objectMetadataItem,
  });

  const selectedTemplate = emailTemplates.find(
    (template) => template.id === selectedTemplateId,
  );

  const handleTemplateSelect = useCallback(
    (template: Note | null) => {
      onSelect(template);
      closeDropdown();
    },
    [onSelect, closeDropdown],
  );

  if (loading) {
    return null;
  }

  const dropdownButton = (
    <StyledDropdownButton>
      <span>{selectedTemplate?.title || t`Select a template`}</span>
      <IconChevronDown size={16} />
    </StyledDropdownButton>
  );

  const dropdownContent = (
    <StyledDropdownList>
      <StyledDropdownItem onClick={() => handleTemplateSelect(null)}>
        <Trans>No template</Trans>
      </StyledDropdownItem>
      {emailTemplates.map((template) => (
        <StyledDropdownItem
          key={template.id}
          isSelected={template.id === selectedTemplateId}
          onClick={() => handleTemplateSelect(template as Note)}
        >
          {template.title}
        </StyledDropdownItem>
      ))}
    </StyledDropdownList>
  );

  return (
    <StyledContainer>
      <StyledLabel>
        <Trans>Email Template</Trans>
      </StyledLabel>
      <Dropdown
        dropdownId={dropdownId}
        clickableComponent={dropdownButton}
        dropdownComponents={dropdownContent}
        dropdownPlacement="bottom-start"
        dropdownHotkeyScope={{ scope: dropdownId }}
      />
      <StyledDisclaimer>
        <Trans>
          You can edit email templates in Settings → Email Templates
        </Trans>
        <StyledEditLink to="/settings/email-templates">
          <Trans>Edit</Trans>
        </StyledEditLink>
      </StyledDisclaimer>
    </StyledContainer>
  );
};
