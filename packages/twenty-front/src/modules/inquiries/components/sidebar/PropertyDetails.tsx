import { useAttachments } from '@/activities/files/hooks/useAttachments';
import { DateFormat } from '@/localization/constants/DateFormat';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useFormattedPropertyFields } from '@/object-record/hooks/useFormattedPropertyFields';
import { PlatformBadge } from '@/object-record/record-show/components/nm/publication/PlatformBadge';
import { StyledLoadingContainer } from '@/object-record/record-show/components/ui/PropertyDetailsCardComponents';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { usePublicationsOfProperty } from '@/ui/layout/show-page/hooks/usePublicationsOfProperty';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  IconArrowUpRight,
  IconCalendar,
  IconChevronDown,
  IconLayoutBottombarCollapse,
  IconMap,
  IconPhoto,
  useIcons,
} from 'twenty-ui';
import { formatAmount } from '~/utils/format/formatAmount';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  overflow-y: auto;
`;

const StyledHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)};
  height: 42px;
`;

const StyledHeaderContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledHeaderTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledImage = styled.img`
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const StyledImageContainer = styled.div`
  align-items: center;
  aspect-ratio: 1;
  width: 70px;
  height: 70px;
  background: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
`;

const StyledPropertyAddress = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledPropertyDetails = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border-left: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 400px;
  flex-shrink: 0;
`;

const StyledPropertyName = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledHoverName = styled(Link)`
  text-decoration: none;
  color: ${({ theme }) => theme.font.color.primary};
  &:hover {
    color: ${({ theme }) => theme.color.blue};
    text-decoration: underline;
    cursor: pointer;
  }
`;

const StyledPropertyPrice = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin: ${({ theme }) => theme.spacing(1.5, 0)};
  text-decoration: underline;
`;

const StyledDetailCard = styled.div`
  align-items: center;
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(0.5, 1)};
  font-size: ${({ theme }) => theme.font.size.xs};
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: default;
`;

const StyledSectionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledSection = styled.div<{ $transparent?: boolean }>`
  background: ${({ theme, $transparent }) =>
    $transparent ? 'transparent' : theme.background.transparent.lighter};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(3)};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledSectionTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StyledPublicationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  max-height: 300px;
  overflow-y: auto;
`;

const StyledPublicationCardLink = styled(Link)`
  text-decoration: none;
`;

const StyledPublicationCard = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(2)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};

  &:hover {
    background: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledPublicationHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledPublicationDetail = styled.div`
  align-items: center;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  gap: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledPropertyMainSection = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  position: relative;
`;

const StyledMainInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  flex: 1;
`;

// Update field groups to be more focused
const FIELD_GROUPS = {
  'Key Details': [
    'category',
    'offerType',
    'surface',
    'livingSurface',
    'rooms',
    'floor',
    'constructionYear',
  ],
  Overview: ['description'],
  Availability: ['availableFrom', 'stage'],
};

const StyledExpandButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(1)};
  padding: 0;
  transition: all 0.1s ease-in-out;

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledDetailsList = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(2)};
  overflow: hidden;
`;

const StyledDetailGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledDetailGroupTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StyledDetailItem = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledDetailIcon = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  flex-shrink: 0;
  height: 20px;
  justify-content: center;
  width: 20px;
`;

const StyledDetailContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledDetailLabel = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledDetailValue = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  white-space: pre-wrap;
`;

const StyledExpandButtonContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledExpandIcon = styled(motion.div)`
  align-items: center;
  display: flex;
`;

type PropertyDetailsProps = {
  property: any;
  onCollapse: () => void;
};

export const PropertyDetails = ({
  property,
  onCollapse,
}: PropertyDetailsProps) => {
  const theme = useTheme();
  const { t } = useLingui();
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const { getIcon } = useIcons();

  // Get property details from the object metadata
  const { recordFromStore, recordLoading } = useRecordShowContainerData({
    objectNameSingular: CoreObjectNameSingular.Property,
    objectRecordId: property?.id,
  });

  const { publications } = usePublicationsOfProperty(property?.id, 'published');
  const { attachments = [] } = useAttachments({
    id: property?.id,
    targetObjectNameSingular: CoreObjectNameSingular.Property,
  });

  // object metadata
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Property,
  });

  const { formatFieldValue } = useFormattedPropertyFields({
    objectMetadataItem,
  });

  // Use the data from the store if available, otherwise use the passed property
  const propertyData = useMemo(() => {
    return recordFromStore || property;
  }, [recordFromStore, property]);

  // Group fields by predefined categories and filter out empty values
  const groupedFields = useMemo(() => {
    if (!objectMetadataItem) return {};

    return objectMetadataItem.fields.reduce(
      (acc, field) => {
        // Skip fields that are already shown in the overview or not in our groups
        if (
          [
            'name',
            'refProperty',
            'address',
            'sellingPrice',
            'rentNet',
          ].includes(field.name)
        ) {
          return acc;
        }

        // Find which group this field belongs to
        const group = Object.entries(FIELD_GROUPS).find(([_, fields]) =>
          fields.includes(field.name),
        )?.[0];

        // Skip if field is not in any group
        if (!group) return acc;

        // Skip if value is empty/null
        const value = propertyData[field.name];
        if (value === undefined || value === null || value === '') return acc;

        if (!acc[group]) {
          acc[group] = [];
        }
        acc[group].push(field);
        return acc;
      },
      {} as Record<string, any[]>,
    );
  }, [objectMetadataItem, propertyData]);

  const propertyImages = useMemo(
    () =>
      attachments
        .filter((attachment) => attachment.type === 'PropertyImage')
        .sort((a, b) => a.orderIndex - b.orderIndex),
    [attachments],
  );

  if (!propertyData) return null;

  const formattedPrice = propertyData.rentNet?.amountMicros
    ? `${formatAmount(propertyData.rentNet.amountMicros / 1000000)} ${propertyData.rentNet.currencyCode}`
    : propertyData.sellingPrice?.amountMicros
      ? `${formatAmount(propertyData.sellingPrice.amountMicros / 1000000)} ${propertyData.sellingPrice.currencyCode}`
      : null;

  const isRental = propertyData.category === 'Rental';

  const renderDetailValue = (field: any, value: any) => {
    return formatFieldValue(field, value);
  };

  if (recordLoading) {
    return (
      <StyledPropertyDetails>
        <StyledHeader>
          <StyledHeaderContent>
            <StyledHeaderTitle>
              <Trans>Property Details</Trans>
            </StyledHeaderTitle>
          </StyledHeaderContent>
          <Button
            Icon={IconLayoutBottombarCollapse}
            variant="tertiary"
            onClick={onCollapse}
            disabled={true}
          />
        </StyledHeader>
        <StyledLoadingContainer>
          <Trans>Loading...</Trans>
        </StyledLoadingContainer>
      </StyledPropertyDetails>
    );
  }

  return (
    <StyledPropertyDetails>
      <StyledHeader>
        <StyledHeaderContent>
          <StyledHeaderTitle>
            <Trans>Property Details</Trans>
            <Link
              style={{
                textDecoration: 'none',
              }}
              to={getLinkToShowPage(
                CoreObjectNameSingular.Property,
                propertyData,
              )}
            >
              <Button
                title={t`Open`}
                size="small"
                variant="secondary"
                IconRight={IconArrowUpRight}
              />
            </Link>
          </StyledHeaderTitle>
        </StyledHeaderContent>
        <Button
          Icon={IconLayoutBottombarCollapse}
          variant="tertiary"
          onClick={onCollapse}
        />
      </StyledHeader>
      <StyledContent>
        <StyledSectionsContainer>
          <StyledSection>
            <StyledSectionTitle>
              <Trans>Property Information</Trans>
            </StyledSectionTitle>
            <StyledPropertyMainSection>
              <StyledImageContainer>
                {propertyImages[0] ? (
                  <StyledImage
                    src={propertyImages[0].fullPath}
                    alt={propertyData.name}
                  />
                ) : (
                  <IconPhoto size={28} color={theme.font.color.light} />
                )}
              </StyledImageContainer>
              <StyledMainInfo>
                <StyledPropertyName>
                  <StyledHoverName
                    to={getLinkToShowPage(
                      CoreObjectNameSingular.Property,
                      propertyData,
                    )}
                  >
                    {propertyData.name}
                  </StyledHoverName>
                  <StyledDetailCard>
                    ref: {propertyData.refProperty}
                  </StyledDetailCard>
                </StyledPropertyName>
                {formattedPrice && (
                  <StyledPropertyPrice>
                    {formattedPrice}
                    {isRental && <span> / month</span>}
                  </StyledPropertyPrice>
                )}
                {propertyData.address && (
                  <StyledPropertyAddress>
                    <IconMap size={14} />
                    {[
                      propertyData.address.addressStreet1,
                      propertyData.address.addressCity,
                      propertyData.address.addressPostcode,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </StyledPropertyAddress>
                )}
              </StyledMainInfo>
            </StyledPropertyMainSection>

            <StyledExpandButtonContainer>
              <StyledExpandButton
                onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
              >
                <StyledExpandIcon
                  animate={{ rotate: isDetailsExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <IconChevronDown size={16} />
                </StyledExpandIcon>
                <Trans>
                  {isDetailsExpanded
                    ? 'Show less details'
                    : 'Show more details'}
                </Trans>
              </StyledExpandButton>
            </StyledExpandButtonContainer>

            <AnimatePresence>
              {isDetailsExpanded && (
                <StyledDetailsList
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {Object.entries(groupedFields).map(([section, fields]) => (
                    <StyledDetailGroup key={section}>
                      <StyledDetailGroupTitle>{section}</StyledDetailGroupTitle>
                      {fields.map((field) => {
                        const value = propertyData[field.name];
                        if (value === undefined || value === null) return null;

                        const IconComponent = getIcon(field.icon);

                        return (
                          <StyledDetailItem key={field.name}>
                            <StyledDetailIcon>
                              <IconComponent size={16} />
                            </StyledDetailIcon>
                            <StyledDetailContent>
                              <StyledDetailLabel>
                                {field.label}
                              </StyledDetailLabel>
                              <StyledDetailValue>
                                {renderDetailValue(field, value)}
                              </StyledDetailValue>
                            </StyledDetailContent>
                          </StyledDetailItem>
                        );
                      })}
                    </StyledDetailGroup>
                  ))}
                </StyledDetailsList>
              )}
            </AnimatePresence>
          </StyledSection>

          {publications?.length > 0 && (
            <StyledSection $transparent>
              <StyledSectionTitle>
                <Trans>Active Publications</Trans>
              </StyledSectionTitle>
              <StyledPublicationsList>
                {publications.map((publication: any) => (
                  <StyledPublicationCardLink
                    to={getLinkToShowPage(
                      CoreObjectNameSingular.Publication,
                      publication,
                    )}
                  >
                    <StyledPublicationCard key={publication.id}>
                      <StyledPublicationHeader>
                        <PlatformBadge
                          platformId={publication.platform}
                          size="tiny"
                          variant="no-background"
                        />
                        <StyledDetailCard>
                          ref: {publication.refProperty}
                        </StyledDetailCard>
                      </StyledPublicationHeader>
                      {publication.createdAt && (
                        <StyledPublicationDetail>
                          <IconCalendar size={14} />
                          {format(
                            new Date(publication.createdAt),
                            DateFormat.DAY_FIRST,
                          )}
                        </StyledPublicationDetail>
                      )}
                    </StyledPublicationCard>
                  </StyledPublicationCardLink>
                ))}
              </StyledPublicationsList>
            </StyledSection>
          )}
        </StyledSectionsContainer>
      </StyledContent>
    </StyledPropertyDetails>
  );
};
