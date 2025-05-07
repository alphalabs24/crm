import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useSearchProfiles } from '../../hooks/useSearchProfiles';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { InlineCellHotkeyScope } from '@/object-record/record-inline-cell/types/InlineCellHotkeyScope';
import { useRecordShowContainerActions } from '../../hooks/useRecordShowContainerActions';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import styled from '@emotion/styled';
import groupBy from 'lodash.groupby';
import { isFieldCellSupported } from '@/object-record/utils/isFieldCellSupported';
import { useRecordShowContainerData } from '../../hooks/useRecordShowContainerData';
import { FieldMetadataType } from '~/generated/graphql';
import { SearchProfileMap } from '@/search-profile/components/SearchProfileMap';

const StyledSearchProfileContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledMapContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 0.5;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledInlineCellContainer = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color};
  border-radius: ${({ theme }) => theme.border.radius};
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  flex: 1;
`;

type SearchProfileProps = {
  targetableObject: Pick<
    ActivityTargetableObject,
    'id' | 'targetObjectNameSingular'
  >;
};

export const SearchProfile = ({ targetableObject }: SearchProfileProps) => {
  const { searchProfiles, objectMetadataItem } =
    useSearchProfiles(targetableObject);
  const searchProfile = searchProfiles[0];

  const { labelIdentifierFieldMetadataItem, objectMetadataItems } =
    useRecordShowContainerData({
      objectNameSingular: CoreObjectNameSingular.SearchProfile,
      objectRecordId: searchProfile?.id,
    });

  const { useUpdateOneObjectRecordMutation } = useRecordShowContainerActions({
    objectNameSingular: CoreObjectNameSingular.SearchProfile,
    objectRecordId: searchProfile?.id,
    recordFromStore: searchProfile ?? null,
  });

  const availableFieldMetadataItems = objectMetadataItem.fields
    .filter(
      (fieldMetadataItem) =>
        isFieldCellSupported(fieldMetadataItem, objectMetadataItems) &&
        fieldMetadataItem.id !== labelIdentifierFieldMetadataItem?.id,
    )
    .sort((fieldMetadataItemA, fieldMetadataItemB) =>
      fieldMetadataItemA.name.localeCompare(fieldMetadataItemB.name),
    );

  const { inlineFieldMetadataItems, relationFieldMetadataItems } = groupBy(
    availableFieldMetadataItems.filter(
      (fieldMetadataItem) =>
        fieldMetadataItem.name !== 'createdAt' &&
        fieldMetadataItem.name !== 'deletedAt',
    ),
    (fieldMetadataItem) =>
      fieldMetadataItem.type === FieldMetadataType.RELATION
        ? 'relationFieldMetadataItems'
        : 'inlineFieldMetadataItems',
  );

  return (
    <StyledSearchProfileContainer>
      <StyledMapContainer>
        {searchProfile && (
          <SearchProfileMap
            searchProfileId={searchProfile.id}
            initialGeoJson={searchProfile.geoJson}
          />
        )}
      </StyledMapContainer>
      <StyledInlineCellContainer>
        {searchProfile &&
          inlineFieldMetadataItems.map((field, index) => (
            <FieldContext.Provider
              key={searchProfile.id + field.id}
              value={{
                recordId: searchProfile.id,
                maxWidth: 200,
                recoilScopeId: searchProfile.id + field.id,
                isLabelIdentifier: false,
                fieldDefinition: formatFieldMetadataItemAsColumnDefinition({
                  field: field,
                  position: index,
                  objectMetadataItem,
                  showLabel: true,
                  labelWidth: 190,
                  layout: 'column',
                }),
                useUpdateRecord: useUpdateOneObjectRecordMutation,
                hotkeyScope: InlineCellHotkeyScope.InlineCell,
              }}
            >
              <RecordInlineCell loading={false} />
            </FieldContext.Provider>
          ))}
      </StyledInlineCellContainer>
    </StyledSearchProfileContainer>
  );
};
