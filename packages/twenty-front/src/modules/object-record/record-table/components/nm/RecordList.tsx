import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useFormattedPropertyFields } from '@/object-record/hooks/useFormattedPropertyFields';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';
import { StatusBadge } from '@/object-record/record-show/components/nm/publication/StatusBadge';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { RECORD_TABLE_CLICK_OUTSIDE_LISTENER_ID } from '@/object-record/record-table/constants/RecordTableClickOutsideListenerId';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableEmptyState } from '@/object-record/record-table/empty-state/components/RecordTableEmptyState';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { isRecordTableInitialLoadingComponentState } from '@/object-record/record-table/states/isRecordTableInitialLoadingComponentState';
import { hasPendingRecordComponentSelector } from '@/object-record/record-table/states/selectors/hasPendingRecordComponentSelector';
import { selectedRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/selectedRowIdsComponentSelector';
import { calculateCompletionLevel } from '@/object-record/utils/calculateCompletionLevel';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { DragSelect } from '@/ui/utilities/drag-select/components/DragSelect';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useIcons } from '@ui/display/icon/hooks/useIcons';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useRef } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  IconAlertTriangle,
  IconCheck,
  IconDots,
  IconEye,
  IconMap,
  IconPencil,
  IconPhoto,
  IconSquare,
  LARGE_DESKTOP_VIEWPORT,
  MenuItem,
  MOBILE_VIEWPORT,
  useIsMobile,
} from 'twenty-ui';
import { formatAmount } from '~/utils/format/formatAmount';

import { RecordListDataLoaderEffect } from './RecordListDataLoaderEffect';
import { RecordListSkeletonLoader } from './RecordListSkeletonLoader';

const StyledListContainer = styled.div<{ empty?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};

  height: 100%;
  padding: ${({ theme }) => theme.spacing(2)};
  ${({ empty }) =>
    empty &&
    css`
      justify-content: center;
    `}
`;

const StyledCard = styled(motion.div)<{ isSelected?: boolean }>`
  background: ${({ theme, isSelected }) =>
    isSelected ? theme.background.secondary : theme.background.primary};

  border-radius: ${({ theme }) => theme.border.radius.md};
  border: 2px solid
    ${({ theme, isSelected }) =>
      isSelected ? theme.border.color.blue : theme.border.color.light};
  cursor: pointer;
  display: flex;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(1.5)};
  position: relative;
  flex-direction: column;

  min-height: 400px;

  @media only screen and (min-width: ${MOBILE_VIEWPORT}px) {
    min-height: 120px;
    height: 120px;
    flex-direction: row;

    border: 1px solid
      ${({ theme, isSelected }) =>
        isSelected ? theme.border.color.medium : theme.border.color.light};
  }
`;

const StyledImageSection = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  max-height: 150px;

  @media only screen and (min-width: ${MOBILE_VIEWPORT}px) {
    margin-right: ${({ theme }) => theme.spacing(2)};
    max-height: unset;
    margin-bottom: 0;
  }
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
  position: absolute;
  right: ${({ theme }) => theme.spacing(3)};
  top: ${({ theme }) => theme.spacing(3)};
  justify-content: center;

  @media only screen and (min-width: ${MOBILE_VIEWPORT}px) {
    position: relative;
    right: unset;
    top: unset;
    justify-content: flex-start;
  }
`;

const StyledSelectionCircle = styled.div<{ isSelected?: boolean }>`
  align-items: center;
  background: ${({ theme, isSelected }) =>
    isSelected ? theme.color.blue : theme.background.transparent.light};
  border: 2px solid
    ${({ theme, isSelected }) =>
      isSelected ? theme.color.blue : theme.border.color.strong};
  border-radius: 50%;
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  color: white;
  display: flex;
  height: 20px;
  justify-content: center;
  width: 20px;
`;

const StyledStageTag = styled.div`
  top: ${({ theme }) => theme.spacing(2)};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  left: ${({ theme }) => theme.spacing(2)};
  position: absolute;
  white-space: nowrap;
  z-index: 1;

  @media only screen and (min-width: ${MOBILE_VIEWPORT}px) {
    left: 50%;
    bottom: ${({ theme }) => theme.spacing(2)};
    top: unset;
    transform: translateX(-50%);
  }
`;

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  justify-content: space-between;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(0.5)};
  max-width: 350px;
  min-width: 200px;

  margin-bottom: ${({ theme }) => theme.spacing(2)};

  @media only screen and (min-width: ${MOBILE_VIEWPORT}px) {
    flex: 0.5;
  }
`;

const StyledUpperContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledLowerContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(1.5)};
`;

const StyledDate = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  margin-bottom: ${({ theme }) => theme.spacing(0)};
`;

const StyledHeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
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
  line-height: 1.4;

  &:hover {
    color: ${({ theme }) => theme.color.blue};
    text-decoration: underline;
  }
`;

const StyledLocationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(0.25)};
`;

const StyledAddress = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
`;

const StyledDetails = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(4)};
  font-size: ${({ theme }) => theme.font.size.xs};
  margin-bottom: ${({ theme }) => theme.spacing(0)};
  padding: ${({ theme }) => theme.spacing(0, 0.5)};
  flex-wrap: wrap;
`;

const StyledDetailItem = styled.div`
  display: flex;
  flex-direction: column;
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

const StyledFooterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing(0.5)};
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
  align-items: flex-end;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: flex-end;
  flex-wrap: wrap;

  @media only screen and (min-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
  }
  @media only screen and (min-width: ${LARGE_DESKTOP_VIEWPORT}px) {
    flex-direction: row;
  }
`;

const StyledMiddleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  flex: 1;
`;

const StyledPlatformBadgeContainer = styled.div`
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

// Create styled components for skeleton loader
const StyledSkeletonCard = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  padding: ${({ theme }) => theme.spacing(1.5)};
  position: relative;
`;

const StyledSkeletonImageSection = styled.div`
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  margin-right: ${({ theme }) => theme.spacing(2)};
  position: relative;
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  position: relative;
`;

const StyledSkeletonContentSection = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  padding: ${({ theme }) => theme.spacing(0.5, 0)};
  justify-content: center;
`;

const StyledSkeletonUpperSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

// Create a skeleton card loader component
const RecordListSkeletonCard = () => {
  const theme = useTheme();

  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={theme.border.radius.sm}
    >
      <StyledSkeletonCard>
        <StyledSkeletonImageSection />
        <StyledSkeletonContentSection>
          <StyledSkeletonUpperSection>
            <Skeleton width={80} height={12} />
            <Skeleton width="30%" height={24} />
            <Skeleton width="50%" height={20} />
            <Skeleton width="50%" height={30} />
          </StyledSkeletonUpperSection>
        </StyledSkeletonContentSection>
      </StyledSkeletonCard>
    </SkeletonTheme>
  );
};

type FieldDetailItemProps = {
  fieldName: string;
  value: any;
  objectNameSingular: string;
};

const FieldDetailItem = ({
  fieldName,
  value,
  objectNameSingular,
}: FieldDetailItemProps) => {
  const { getIcon } = useIcons();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { formatFieldValue } = useFormattedPropertyFields({
    objectMetadataItem,
  });

  const fieldMetadata = useMemo(() => {
    return objectMetadataItem.fields.find((field) => field.name === fieldName);
  }, [fieldName, objectMetadataItem]);

  const formattedValue = useMemo(() => {
    if (!fieldMetadata) return String(value ?? '-');
    return formatFieldValue(fieldMetadata, value) ?? '-';
  }, [fieldMetadata, formatFieldValue, value]);

  const Icon = useMemo(() => {
    if (fieldMetadata?.icon) {
      return getIcon(fieldMetadata.icon);
    }
    return null;
  }, [fieldMetadata, getIcon]);

  if (!value) return null;

  return (
    <StyledDetailItem>
      <StyledDetailIcon>
        {Icon && <Icon size={14} />}
        <StyledDetailLabel>
          {fieldMetadata?.label || fieldName}
        </StyledDetailLabel>
      </StyledDetailIcon>
      <StyledDetailValue>{formattedValue}</StyledDetailValue>
    </StyledDetailItem>
  );
};

export const RecordList = () => {
  const { recordTableId, objectNameSingular } = useRecordTableContextOrThrow();
  const navigate = useNavigate();

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

  if (isRecordTableInitialLoading) {
    return (
      <StyledListContainer ref={listContainerRef}>
        <RecordListDataLoaderEffect />
        <RecordListSkeletonLoader />
      </StyledListContainer>
    );
  }

  if (recordTableIsEmpty) {
    return (
      <StyledListContainer ref={listContainerRef} empty={recordTableIsEmpty}>
        <RecordListDataLoaderEffect />
        <RecordTableEmptyState />
      </StyledListContainer>
    );
  }

  return (
    <>
      <StyledListContainer ref={listContainerRef}>
        <RecordListDataLoaderEffect />
        <AnimatePresence
          mode="wait"
          key={`${recordTableId}-${allRecordIds.length}`}
        >
          {allRecordIds.map((recordId) => (
            <RecordListItem
              key={recordId}
              recordId={recordId}
              objectNameSingular={objectNameSingular}
              isSelected={selectedRowIds.includes(recordId)}
              onSelect={(selected) => setRowSelected(recordId, selected)}
              onClick={() => {
                if (selectedRowIds.includes(recordId)) {
                  setRowSelected(recordId, false);
                } else {
                  navigate(
                    getLinkToShowPage(objectNameSingular, {
                      id: recordId,
                    }),
                  );
                }
              }}
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
  onClick: () => void;
};

const getDisplayPriorityFields = () => {
  // Filter for publication-specific fields here if necessary

  // Use property priority fields
  return [
    'refProperty',
    'category',
    'surface',
    'rooms',
    'livingSurface',
    'numberOfFloors',
    // 'volume',
    'floor',
    'constructionYear',
    'renovationYear',
  ];
};

// Add a new function to format price display
const formatPrice = (price: any) => {
  if (!price || !price?.amountMicros) return null;

  const amount = price?.amountMicros / 1000000;
  const currency = price?.currencyCode || 'EUR';

  return `${formatAmount(amount)} ${currency}`;
};

// Create a styled component for price display
const StyledPriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(1)};
  text-decoration: underline;
`;

const StyledPrice = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledRentalLabel = styled.span`
  font-size: ${({ theme }) => theme.font.size.xs};
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-left: ${({ theme }) => theme.spacing(0.5)};
`;

const RecordListItem = ({
  recordId,
  objectNameSingular,
  isSelected,
  onSelect,
  onClick,
}: RecordListItemProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { t } = useLingui();
  const dropdownId = `record-list-item-dropdown-${recordId}`;
  const { closeDropdown } = useDropdown(dropdownId);
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
    const percentage = completionInfo.percentage;
    if (completionInfo.level === 'low')
      return t`Insufficient Details (${percentage}%)`;
    if (completionInfo.level === 'medium')
      return t`Good Enough (${percentage}%)`;
    return t`Complete (${percentage}%)`;
  }, [completionInfo, t]);

  const createdAtFormatted = useMemo(() => {
    if (!record?.createdAt) return '';
    return format(new Date(record.createdAt), 'MMM d, yyyy');
  }, [record?.createdAt]);

  const handleCardClick = () => {
    onClick?.();
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

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (record) {
      const path = getLinkToShowPage(objectNameSingular, record);
      if (path) {
        navigate(path + '/edit');
      }
    }
  };

  const priorityFields = useMemo(() => {
    if (!record) return [];
    return getDisplayPriorityFields()
      .filter((field) => record[field] !== undefined && record[field] !== null)
      .slice(0, isMobile ? 5 : 8);
  }, [isMobile, record]);

  // Format price for display
  const formattedPrice = useMemo(() => {
    if (!record) return null;

    const rent = record.rentNet;
    const price = record.sellingPrice;

    if (rent?.amountMicros) {
      return formatPrice(rent);
    }
    if (price?.amountMicros) {
      return formatPrice(price);
    }
    return null;
  }, [record]);

  // Check if it's a rental property
  const isRental = useMemo(() => {
    return record?.category === 'Rental';
  }, [record]);

  return (
    <StyledCard
      isSelected={isSelected}
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.15 }}
      whileHover={{
        boxShadow: theme.boxShadow.light,
      }}
      layout
      data-selectable-id={recordId}
    >
      <StyledSelectionIndicator
        initial={{ x: -40, width: 0, opacity: 0 }}
        animate={{
          x: isSelected ? 4 : -40,
          width: isSelected ? 45 : 0,
          opacity: isSelected ? 1 : 0,
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
            <StyledImage src={mainImage} alt={record?.name} />
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
          {record?.stage && (
            <StyledStageTag>
              <StatusBadge status={record.stage} size="small" />
            </StyledStageTag>
          )}
        </StyledImageContainer>
      </StyledImageSection>

      <StyledContentContainer>
        <StyledUpperContentContainer>
          <StyledHeaderContainer>
            <StyledDate>{createdAtFormatted}</StyledDate>
            <StyledTitleContainer>
              <StyledTitle onClick={handleViewDetails}>
                {record?.name}
              </StyledTitle>
              {record?.platform && (
                <StyledPlatformBadgeContainer>
                  <PlatformBadge
                    platformId={record?.platform}
                    size="small"
                    variant="no-background"
                  />
                </StyledPlatformBadgeContainer>
              )}
            </StyledTitleContainer>

            {record?.address && (
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

            {/* Display price information if available */}
            {formattedPrice && (
              <StyledPriceContainer>
                <StyledPrice>{formattedPrice}</StyledPrice>
                {isRental && <StyledRentalLabel>/month</StyledRentalLabel>}
              </StyledPriceContainer>
            )}
          </StyledHeaderContainer>
        </StyledUpperContentContainer>

        <StyledLowerContentContainer>
          <StyledFooterContainer>
            <StyledCompletionStatus level={completionInfo.level}>
              {completionInfo.level === 'low' && (
                <IconAlertTriangle size={14} />
              )}
              {completionInfo.level === 'medium' && <IconCheck size={14} />}
              {completionInfo.level === 'high' && <IconCheck size={14} />}
              {completionLabel}
            </StyledCompletionStatus>
          </StyledFooterContainer>
        </StyledLowerContentContainer>
      </StyledContentContainer>
      <StyledMiddleSection>
        {priorityFields.length > 0 && (
          <StyledDetails>
            {priorityFields.map((fieldName) => (
              <FieldDetailItem
                key={fieldName}
                fieldName={fieldName}
                value={record?.[fieldName]}
                objectNameSingular={objectNameSingular}
              />
            ))}
          </StyledDetails>
        )}
      </StyledMiddleSection>
      <StyledRightSection>
        <Button
          title={t`Edit`}
          Icon={IconPencil}
          size="small"
          variant="secondary"
          onClick={handleEdit}
        />
        <Button
          title={t`Show Details`}
          Icon={IconEye}
          size="small"
          variant="secondary"
          onClick={handleViewDetails}
        />
        <Dropdown
          dropdownId={dropdownId}
          clickableComponent={
            <Button
              title={t`More`}
              Icon={IconDots}
              size="small"
              variant="secondary"
            />
          }
          dropdownMenuWidth={160}
          dropdownComponents={[
            <DropdownMenuItemsContainer>
              <MenuItem
                text={isSelected ? t`Selected` : t`Select`}
                LeftIcon={isSelected ? IconCheck : IconSquare}
                onClick={() => {
                  onSelect(!isSelected);
                  closeDropdown();
                }}
                disabled={false}
                accent={isSelected ? 'active' : 'default'}
              />
            </DropdownMenuItemsContainer>,
          ]}
          dropdownHotkeyScope={{ scope: dropdownId }}
        />
      </StyledRightSection>
    </StyledCard>
  );
};
