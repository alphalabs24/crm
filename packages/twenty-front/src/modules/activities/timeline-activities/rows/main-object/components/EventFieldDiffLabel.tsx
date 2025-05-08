import styled from '@emotion/styled';
import { Icon123, useIcons } from 'twenty-ui';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldUuid } from '@/object-record/record-field/types/guards/isFieldUuid';

type EventFieldDiffLabelProps = {
  fieldMetadataItem: FieldMetadataItem;
};

const StyledUpdatedFieldContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledUpdatedFieldIconContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  height: 14px;
  width: 14px;
`;

export const EventFieldDiffLabel = ({
  fieldMetadataItem,
}: EventFieldDiffLabelProps) => {
  const { getIcon } = useIcons();

  const IconComponent = fieldMetadataItem?.icon
    ? getIcon(fieldMetadataItem?.icon)
    : Icon123;

  const isUUID = isFieldUuid({ type: fieldMetadataItem.type });

  return (
    <StyledUpdatedFieldContainer>
      <StyledUpdatedFieldIconContainer>
        <IconComponent />
      </StyledUpdatedFieldIconContainer>
      {isUUID
        ? fieldMetadataItem.label.split('Foreign Key')[0]
        : fieldMetadataItem.label}
    </StyledUpdatedFieldContainer>
  );
};
