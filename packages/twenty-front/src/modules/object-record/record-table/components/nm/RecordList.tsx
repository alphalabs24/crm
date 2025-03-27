import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useLazyLoadRecordIndexTable } from '@/object-record/record-index/hooks/useLazyLoadRecordIndexTable';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/RecordTableClickOutsideListenerId';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { hasPendingRecordComponentSelector } from '@/object-record/record-table/states/selectors/hasPendingRecordComponentSelector';
import { selectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsComponentSelector';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { isNull } from '@sniptt/guards';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import {
    Button,
    IconBuildingSkyscraper,
    IconCalendar,
    IconCheck,
    IconEye,
    IconHome,
    IconLoader,
    IconMap,
    IconPhoto,
    IconRuler,
    IconSearch,
    IconUsers,
} from 'twenty-ui';

const StyledListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  overflow: auto;
  height: 100%;
`;

const StyledEmptyContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  height: 300px;
  justify-content: center;
`;

const StyledEmptyStateIcon = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: 50%;
  display: flex;
  height: 64px;
  justify-content: center;
  width: 64px;
`;

const StyledEmptyStateText = styled.div`
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledLoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 200px;
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledCard = styled(motion.div)<{ isSelected?: boolean }>`
  background: ${({ theme, isSelected }) =>
    isSelected
      ? theme.background.transparent.lighter
      : theme.background.primary};

  border-radius: ${({ theme }) => theme.border.radius.md};
  border: 1px solid
    ${({ theme, isSelected }) =>
      isSelected ? theme.border.color.medium : theme.border.color.light};
  cursor: pointer;
  display: flex;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(1.5)};
  position: relative;
  min-height: 120px;
  height: 120px;
`;

const StyledImageSection = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledImageContainer = styled.div`
  flex: 1;
  aspect-ratio: 1;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  overflow: hidden;
  position: relative;
  background: ${({ theme }) => theme.background.tertiary};
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const StyledImage = styled.img`
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const StyledSelectionIndicator = styled(motion.div)<{ isSelected?: boolean }>`
  align-items: center;
  display: flex;
  pointer-events: none;
  position: relative;
  z-index: 2;
`;

const StyledSelectionCircle = styled.div<{ isSelected?: boolean }>`
  align-items: center;
  background: ${({ theme, isSelected }) =>
    isSelected ? theme.color.blue : theme.background.primary};
  border: 2px solid
    ${({ theme, isSelected }) =>
      isSelected ? theme.color.blue : theme.border.color.strong};
  border-radius: 50%;
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  color: white;
  display: flex;
  height: 24px;
  justify-content: center;
  width: 24px;
`;

const StyledStageTag = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  bottom: ${({ theme }) => theme.spacing(1)};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  left: 50%;
  max-width: 110px;
  overflow: hidden;
  padding: ${({ theme }) => `${theme.spacing(0.5)} ${theme.spacing(1.5)}`};
  position: absolute;
  text-overflow: ellipsis;
  transform: translateX(-50%);
  white-space: nowrap;
  z-index: 1;
`;

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  justify-content: space-between;
  overflow: hidden;
`;

const StyledDate = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  margin-bottom: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledHeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledTitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledTitle = styled.a`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.color.blue};
    text-decoration: underline;
  }
`;

const StyledLocationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledAddress = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledDetails = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.xs};
  margin-bottom: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledDetailItem = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

const StyledDetailIcon = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-bottom: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledDetailLabel = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
`;

const StyledDetailValue = styled.span`
  font-weight: ${({ theme }) => theme.font.weight.medium};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  width: 14px;
`;

const StyledFooterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const StyledCompletionStatus = styled.div<{ level: 'low' | 'medium' | 'high' }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme, level }) =>
    level === 'low'
      ? theme.color.yellow
      : level === 'medium'
        ? theme.color.blue
        : theme.color.green};
`;

const StyledRightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledPlatformBadgeContainer = styled.div`
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

// This component is similar to RecordTableNoRecordGroupBodyEffect
// It ensures records are loaded when the component mounts
const RecordListDataLoaderEffect = () => {
  const { objectNameSingular } = useRecordTableContextOrThrow();
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const [hasInitialized, setHasInitialized] = useState(false);

  const { findManyRecords, records, totalCount, setRecordTableData, loading } =
    useLazyLoadRecordIndexTable(objectNameSingular);

  // Initialize data loading
  useEffect(() => {
    if (isNull(currentWorkspaceMember)) {
      return;
    }

    if (!hasInitialized) {
      findManyRecords();
      setHasInitialized(true);
    }
  }, [currentWorkspaceMember, findManyRecords, hasInitialized]);

  // Update record table data when records change
  useEffect(() => {
    if (!loading) {
      setRecordTableData({
        records,
        totalCount,
      });
    }
  }, [records, totalCount, setRecordTableData, loading]);

  return null;
};

export const RecordList = () => {
  const { recordTableId, objectNameSingular } = useRecordTableContextOrThrow();
  const { setRowSelected, resetTableRowSelection } = useRecordTable({
    recordTableId,
  });
  const listContainerRef = useRef<HTMLDivElement>(null);

  const { toggleClickOutsideListener } = useClickOutsideListener(
    RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID,
  );

  const isRecordTableInitialLoading = useRecoilComponentValueV2(
    isRecordTableInitialLoadingComponentState,
    recordTableId,
  );

  const allRecordIds = useRecoilComponentValueV2(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  const hasPendingRecord = useRecoilComponentValueV2(
    hasPendingRecordComponentSelector,
    recordTableId,
  );

  const selectedRowIds = useRecoilComponentValueV2(
    selectedRowIdsComponentSelector,
    recordTableId,
  );

  const recordTableIsEmpty =
    !isRecordTableInitialLoading &&
    allRecordIds.length === 0 &&
    !hasPendingRecord;

  // Return loading message when loading
  if (isRecordTableInitialLoading) {
    return (
      <StyledListContainer ref={listContainerRef}>
        <RecordListDataLoaderEffect />
        <StyledLoadingContainer>
          <IconLoader size={24} />
          <Trans>Loading records...</Trans>
        </StyledLoadingContainer>
      </StyledListContainer>
    );
  }

  if (recordTableIsEmpty) {
    return (
      <StyledListContainer ref={listContainerRef}>
        <RecordListDataLoaderEffect />
        <StyledEmptyContainer>
          <StyledEmptyStateIcon>
            <IconSearch size={32} />
          </StyledEmptyStateIcon>
          <StyledEmptyStateText>
            <Trans>No records found</Trans>
          </StyledEmptyStateText>
        </StyledEmptyContainer>
      </StyledListContainer>
    );
  }

  return (
    <>
      <StyledListContainer ref={listContainerRef}>
        <RecordListDataLoaderEffect />
        <AnimatePresence>
          {allRecordIds.map((recordId) => (
            <RecordListItem
              key={recordId}
              recordId={recordId}
              objectNameSingular={objectNameSingular}
              isSelected={selectedRowIds.includes(recordId)}
              onSelect={(selected) => setRowSelected(recordId, selected)}
            />
          ))}
        </AnimatePresence>
      </StyledListContainer>
      <DragSelect
        dragSelectable={listContainerRef}
        onDragSelectionStart={() => {
          resetTableRowSelection();
          toggleClickOutsideListener(false);
        }}
        onDragSelectionChange={setRowSelected}
        onDragSelectionEnd={() => {
          toggleClickOutsideListener(true);
        }}
      />
    </>
  );
};

type RecordListItemProps = {
  recordId: string;
  objectNameSingular: string;
  isSelected?: boolean;
  onSelect: (selected: boolean) => void;
};

const calculateCompletionLevel = (record: any) => {
  if (!record) return { level: 'low' as const, percentage: 0 };

  // Fields to check for completeness
  const fields = [
    'name',
    'description',
    'address',
    'surface',
    'rooms',
    'category',
    'priceUnit',
    'sellingPrice',
    'rentNet',
    'floor',
    'constructionYear',
    'renovationYear',
    'features',
    'volume',
    'refProperty',
    'platform',
  ];

  // Count how many fields are filled
  const filledFields = fields.filter((field) => {
    const value = record[field];
    return (
      value !== undefined &&
      value !== null &&
      (typeof value !== 'string' || value.trim() !== '')
    );
  }).length;

  const percentage = Math.round((filledFields / fields.length) * 100);

  if (percentage < 40) return { level: 'low' as const, percentage };
  if (percentage < 75) return { level: 'medium' as const, percentage };
  return { level: 'high' as const, percentage };
};

const getDisplayPriorityFields = (record: any) => {
  // Check if it's a publication by looking for publication-specific fields
  const isPublication = record.platform !== undefined;

  if (isPublication) {
    return ['category', 'platform'];
  }

  // Use property priority fields
  return ['surface', 'rooms', 'category', 'floor'];
};

const RecordListItem = ({
  recordId,
  objectNameSingular,
  isSelected,
  onSelect,
}: RecordListItemProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useLingui();

  const { recordFromStore: record } = useRecordShowContainerData({
    objectNameSingular,
    objectRecordId: recordId,
  });

  const { attachments = [] } = useAttachments({
    id: recordId,
    targetObjectNameSingular: objectNameSingular,
  });

  const images = useMemo(
    () =>
      attachments
        .filter((attachment) => attachment.type === 'PropertyImage')
        .sort((a, b) => a.orderIndex - b.orderIndex),
    [attachments],
  );

  const mainImage = images[0]?.fullPath;

  const completionInfo = useMemo(
    () => calculateCompletionLevel(record),
    [record],
  );

  const completionLabel = useMemo(() => {
    if (completionInfo.level === 'low')
      return t`Insufficient (${completionInfo.percentage}%)`;
    if (completionInfo.level === 'medium')
      return t`Satisfactory (${completionInfo.percentage}%)`;
    return t`Complete (${completionInfo.percentage}%)`;
  }, [completionInfo, t]);

  const createdAtFormatted = useMemo(() => {
    if (!record?.createdAt) return '';
    return format(new Date(record.createdAt), 'MMM d, yyyy');
  }, [record?.createdAt]);

  const handleCardClick = () => {
    onSelect(!isSelected);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (record) {
      const path = getLinkToShowPage(objectNameSingular, record);
      if (path) {
        navigate(path);
      }
    }
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (record) {
      const path = getLinkToShowPage(objectNameSingular, record);
      if (path) {
        navigate(path);
      }
    }
  };

  const displayedDetails = useMemo(() => {
    if (!record) return [];

    // Get priority fields based on record type
    const priorityFields = getDisplayPriorityFields(record);

    return priorityFields
      .filter((field) => record[field] !== undefined && record[field] !== null)
      .slice(0, 2) // Limit to 2 details
      .map((field) => {
        let icon;
        const label = field.charAt(0).toUpperCase() + field.slice(1);

        switch (field) {
          case 'surface':
            icon = <IconRuler size={14} />;
            return {
              field,
              icon,
              label,
              value: `${record[field]} m²`,
            };
          case 'rooms':
            icon = <IconUsers size={14} />;
            return {
              field,
              icon,
              label,
              value: record[field],
            };
          case 'category':
            icon = <IconBuildingSkyscraper size={14} />;
            return {
              field,
              icon,
              label,
              value: record[field],
            };
          case 'floor':
            icon = <IconHome size={14} />;
            return {
              field,
              icon,
              label,
              value: record[field],
            };
          case 'platform':
            icon = <IconCalendar size={14} />;
            return {
              field,
              icon,
              label,
              value: record[field],
            };
          default:
            return {
              field,
              icon: null,
              label,
              value: record[field],
            };
        }
      });
  }, [record]);

  if (!record) return null;

  return (
    <StyledCard
      isSelected={isSelected}
      onClick={handleCardClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      layout
      data-selectable-id={recordId}
    >
      <StyledSelectionIndicator
        initial={{ x: -40, width: 0 }}
        animate={{
          x: isSelected ? 4 : -40,
          width: isSelected ? 45 : 0,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <StyledSelectionCircle isSelected={isSelected}>
          {isSelected && <IconCheck size={14} />}
        </StyledSelectionCircle>
      </StyledSelectionIndicator>
      <StyledImageSection>
        <StyledImageContainer>
          {mainImage ? (
            <StyledImage src={mainImage} alt={record.name} />
          ) : (
            <IconPhoto
              size={40}
              color={theme.font.color.light}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          )}
          {record.stage && <StyledStageTag>{record.stage}</StyledStageTag>}
        </StyledImageContainer>
      </StyledImageSection>

      <StyledContentContainer>
        <StyledDate>{createdAtFormatted}</StyledDate>

        <StyledHeaderContainer>
          <StyledTitleContainer>
            <StyledTitle onClick={handleTitleClick}>{record.name}</StyledTitle>
            {record.platform && (
              <StyledPlatformBadgeContainer>
                <PlatformBadge
                  platformId={record.platform}
                  size="small"
                  variant="no-background"
                />
              </StyledPlatformBadgeContainer>
            )}
          </StyledTitleContainer>

          {record.address && (
            <StyledLocationContainer>
              <IconMap size={12} color={theme.font.color.tertiary} />
              <StyledAddress>
                {[
                  record.address.addressStreet1,
                  record.address.addressCity,
                  record.address.addressPostcode,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </StyledAddress>
            </StyledLocationContainer>
          )}
        </StyledHeaderContainer>

        <StyledDetails>
          {displayedDetails.map((detail, index) => (
            <StyledDetailItem key={index}>
              <StyledDetailIcon>
                {detail.icon}
                <StyledDetailLabel>{detail.label}</StyledDetailLabel>
              </StyledDetailIcon>
              <StyledDetailValue>{detail.value}</StyledDetailValue>
            </StyledDetailItem>
          ))}
        </StyledDetails>

        <StyledFooterContainer>
          <StyledCompletionStatus level={completionInfo.level}>
            {completionInfo.level === 'low' && <IconCalendar size={14} />}
            {completionInfo.level === 'medium' && <IconCalendar size={14} />}
            {completionInfo.level === 'high' && <IconCheck size={14} />}
            {completionLabel}
          </StyledCompletionStatus>

          <StyledRightSection>
            <Button
              title={t`Show Details`}
              Icon={IconEye}
              size="small"
              variant="secondary"
              onClick={handleViewDetails}
            />
          </StyledRightSection>
        </StyledFooterContainer>
      </StyledContentContainer>
    </StyledCard>
  );
};
