import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useSearchProfiles } from '../../hooks/useSearchProfiles';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { InlineCellHotkeyScope } from '@/object-record/record-inline-cell/types/InlineCellHotkeyScope';
import { useRecordShowContainerActions } from '../../hooks/useRecordShowContainerActions';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import styled from '@emotion/styled';
import { isFieldCellSupported } from '@/object-record/utils/isFieldCellSupported';
import { useRecordShowContainerData } from '../../hooks/useRecordShowContainerData';
import { SearchProfileMap } from '@/search-profile/components/SearchProfileMap';
import { useMemo, useState } from 'react';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { EmptySearchProfile } from '@/search-profile/components/EmptySearchProfile';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { css, useTheme } from '@emotion/react';
import {
  MOBILE_VIEWPORT,
  IconHome,
  IconCurrencyDollar,
  IconInfoCircle,
  LARGE_DESKTOP_VIEWPORT,
} from 'twenty-ui';
import { Trans } from '@lingui/react/macro';

const StyledSearchProfileContainer = styled.div<{ isInRightDrawer?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(2)};

  ${({ isInRightDrawer }) =>
    isInRightDrawer &&
    css`
      padding: 0;
    `}

  @media (min-width: ${LARGE_DESKTOP_VIEWPORT}px) {
    flex-wrap: wrap;
  }
`;

const StyledSectionTitle = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledSectionDescription = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledSectionHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledContentContainer = styled.div<{ isInRightDrawer?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  flex-wrap: wrap;
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding: ${({ theme }) => theme.spacing(3)};

  ${({ isInRightDrawer }) =>
    isInRightDrawer &&
    css`
      flex-direction: column;
      gap: 0;
    `}

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
  }

  @media (min-width: ${LARGE_DESKTOP_VIEWPORT}px) {
    max-width: 1250px;
  }
`;

const StyledMapContainer = styled.div<{ isInRightDrawer?: boolean }>`
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.border.color};
  border-radius: ${({ theme }) => theme.border.radius};
  overflow: hidden;
  padding: ${({ theme, isInRightDrawer }) =>
    isInRightDrawer ? theme.spacing(2) : 0};
`;

const StyledFormContainer = styled.div<{ isInRightDrawer?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  height: fit-content;
`;

const StyledInlineCellContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  flex-direction: column;
`;

const StyledFieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledGroupTitle = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(1)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledGroupIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledFieldsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledMapPlaceholder = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius};
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  height: 100%;
  justify-content: center;
  min-height: 450px;
  width: 100%;
`;

type SearchProfileProps = {
  targetableObject: Pick<
    ActivityTargetableObject,
    'id' | 'targetObjectNameSingular'
  >;
  isInRightDrawer?: boolean;
};

// Fields that should not be displayed to users
const EXCLUDED_FIELD_NAMES = [
  'geoJson', // Managed through map
  'polygon', // Managed through map
  'createdBy', // System field
  'updatedAt', // System field
  'createdAt', // System field
  'deletedAt', // System field
  'person', // Internal Relation
  'buyerLeads', // Internal Relation
];

// Define field groups and their sort order
const FIELD_GROUPS: Record<
  string,
  {
    fields: string[];
    icon: React.ReactNode;
  }
> = {
  'Core Information': {
    fields: ['marketingMethod', 'status'],
    icon: <IconInfoCircle size={16} />,
  },

  'Property Specifications': {
    fields: [
      'roomsMin',
      'roomsMax',
      'livingAreaMin',
      'livingAreaMax',
      'floorspaceMin',
      'floorspaceMax',
      'propertyLandMin',
      'propertyLandMax',
    ],
    icon: <IconHome size={16} />,
  },
  'Price Range': {
    fields: ['priceMin', 'priceMax'],
    icon: <IconCurrencyDollar size={16} />,
  },
};

export const SearchProfile = ({
  targetableObject,
  isInRightDrawer,
}: SearchProfileProps) => {
  const { searchProfiles, objectMetadataItem, loading, refetch } =
    useSearchProfiles(targetableObject);
  const searchProfile = searchProfiles[0];
  const [isCreatingSearchProfile, setIsCreatingSearchProfile] = useState(false);
  const theme = useTheme();
  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.SearchProfile,
  });

  const handleCreateSearchProfile = async () => {
    setIsCreatingSearchProfile(true);
    try {
      await createOneRecord({
        name: `${targetableObject.targetObjectNameSingular} Search Profile`,
        [`${targetableObject.targetObjectNameSingular}Id`]: targetableObject.id,
      });
      refetch();
    } catch (error) {
      console.error('Error creating search profile:', error);
    } finally {
      setIsCreatingSearchProfile(false);
    }
  };

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

  const availableFieldMetadataItems = useMemo(
    () =>
      objectMetadataItem?.fields
        .filter(
          (fieldMetadataItem) =>
            isFieldCellSupported(fieldMetadataItem, objectMetadataItems) &&
            fieldMetadataItem.id !== labelIdentifierFieldMetadataItem?.id &&
            !EXCLUDED_FIELD_NAMES.includes(fieldMetadataItem.name),
        )
        .sort((fieldMetadataItemA, fieldMetadataItemB) =>
          fieldMetadataItemA.name.localeCompare(fieldMetadataItemB.name),
        ) || [],
    [
      objectMetadataItem?.fields,
      objectMetadataItems,
      labelIdentifierFieldMetadataItem?.id,
    ],
  );

  // Group fields by category for better organization - memoized to prevent unnecessary re-renders
  const groupedFields = useMemo(() => {
    const result: Record<string, FieldMetadataItem[]> = {};

    // Initialize groups
    Object.keys(FIELD_GROUPS).forEach((groupName) => {
      result[groupName] = [];
    });

    // Add "Other" group
    result['Other'] = [];

    // Organize fields into their respective groups
    availableFieldMetadataItems.forEach((field) => {
      let assigned = false;

      Object.entries(FIELD_GROUPS).forEach(([groupName, groupConfig]) => {
        if (groupConfig.fields.includes(field.name)) {
          result[groupName].push(field);
          assigned = true;
        }
      });

      // If a field doesn't belong to any group, add it to "Other"
      if (!assigned) {
        result['Other'].push(field);
      }
    });

    // Sort fields within each group according to the defined order
    Object.entries(FIELD_GROUPS).forEach(([groupName, groupConfig]) => {
      if (result[groupName]) {
        result[groupName].sort((a, b) => {
          return (
            groupConfig.fields.indexOf(a.name) -
            groupConfig.fields.indexOf(b.name)
          );
        });
      }
    });

    return result;
  }, [availableFieldMetadataItems]);

  if (isCreatingSearchProfile || loading) {
    return (
      <SkeletonTheme
        baseColor={theme.background.tertiary}
        highlightColor={theme.background.primary}
      >
        <Skeleton height={400} />
      </SkeletonTheme>
    );
  }

  return (
    <StyledSearchProfileContainer isInRightDrawer={isInRightDrawer}>
      {searchProfile ? (
        <>
          <StyledContentContainer isInRightDrawer={isInRightDrawer}>
            <StyledSectionHeader>
              <StyledSectionTitle>Search Profile</StyledSectionTitle>
              <StyledSectionDescription>
                <Trans>
                  This search profile will be used to find properties that match
                  the criteria you've set in order to identify potential
                  opportunities.
                </Trans>
              </StyledSectionDescription>
            </StyledSectionHeader>
            <StyledMapContainer isInRightDrawer={isInRightDrawer}>
              <SearchProfileMap
                searchProfileId={searchProfile.id}
                initialGeoJson={searchProfile.geoJson}
              />
            </StyledMapContainer>
            <StyledFormContainer>
              <StyledInlineCellContainer>
                {Object.entries(groupedFields).map(([groupName, fields]) =>
                  fields.length > 0 ? (
                    <StyledFieldGroup key={groupName}>
                      <StyledGroupTitle>
                        <StyledGroupIcon>
                          {FIELD_GROUPS[groupName]?.icon || (
                            <IconInfoCircle size={16} />
                          )}
                        </StyledGroupIcon>
                        {groupName}
                      </StyledGroupTitle>
                      <StyledFieldsGrid>
                        {fields.map((field, index) => (
                          <FieldContext.Provider
                            key={searchProfile.id + field.id}
                            value={{
                              recordId: searchProfile.id,
                              maxWidth: 200,
                              recoilScopeId: searchProfile.id + field.id,
                              isLabelIdentifier: false,
                              fieldDefinition:
                                formatFieldMetadataItemAsColumnDefinition({
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
                      </StyledFieldsGrid>
                    </StyledFieldGroup>
                  ) : null,
                )}
              </StyledInlineCellContainer>
            </StyledFormContainer>
          </StyledContentContainer>
        </>
      ) : (
        <StyledContentContainer isInRightDrawer={isInRightDrawer}>
          <StyledFormContainer isInRightDrawer={isInRightDrawer}>
            <StyledInlineCellContainer>
              <EmptySearchProfile
                onCreateSearchProfile={handleCreateSearchProfile}
              />
            </StyledInlineCellContainer>
          </StyledFormContainer>
        </StyledContentContainer>
      )}
    </StyledSearchProfileContainer>
  );
};
