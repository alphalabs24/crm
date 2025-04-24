import { useMemo } from 'react';
import { useLingui } from '@lingui/react/macro';
import {
  IconBuildingSkyscraper,
  IconMail,
  IconPhone,
  IconPhoto,
  IconListCheck,
  IconCheck,
} from 'twenty-ui';

import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { PdfBaseConfiguration } from '../../types/types';

import {
  CollapsibleSection,
  StyledSectionTitle,
  StyledOptionsGroup,
  StyledOptionCardContainer,
  PublisherOption,
  StyledOptionCard,
  StyledOptionIcon,
  StyledOptionContent,
  StyledOptionLabel,
  StyledOptionDescription,
} from './PdfConfigurationComponents';

export type AvailabilityChecks = {
  hasAgencyName: boolean;
  hasAgencyEmail: boolean;
  hasAgencyPhone: boolean;
  hasWorkspaceLogo: boolean;
  hasMultipleImages: boolean;
};

export const useAvailabilityChecks = (
  property: ObjectRecord,
  workspaceLogo?: string | null,
  imagesLength = 0,
): AvailabilityChecks => {
  return useMemo(
    () => ({
      hasAgencyName: !!property?.agency?.name,
      hasAgencyEmail: !!property?.agency?.email?.primaryEmail,
      hasAgencyPhone: !!property?.agency?.phone?.primaryPhone,
      hasWorkspaceLogo: !!workspaceLogo,
      hasMultipleImages: imagesLength > 1,
    }),
    [property?.agency, workspaceLogo, imagesLength],
  );
};

export type ConfigUpdateFunction<T extends PdfBaseConfiguration> = (
  updater: (prevConfig: T) => T,
) => void;

// Props for publisher information section
type PublisherInformationSectionProps<T extends PdfBaseConfiguration> = {
  property: ObjectRecord;
  config: T;
  setConfig: ConfigUpdateFunction<T>;
  availability: AvailabilityChecks;
};

// Component for publisher information section
export const PublisherInformationSection = <T extends PdfBaseConfiguration>({
  property,
  config,
  setConfig,
  availability,
}: PublisherInformationSectionProps<T>) => {
  const { t } = useLingui();
  const { hasAgencyName, hasAgencyEmail, hasAgencyPhone, hasWorkspaceLogo } =
    availability;

  const isAgencyBrandingAvailable = hasAgencyName || hasWorkspaceLogo;

  return (
    <>
      <StyledSectionTitle>{t`Publisher Information`}</StyledSectionTitle>
      <StyledOptionsGroup>
        <PublisherOption
          isSelected={config.showPublisherBranding}
          isAvailable={isAgencyBrandingAvailable}
          onClick={() =>
            setConfig((prev) => ({
              ...prev,
              showPublisherBranding: !prev.showPublisherBranding,
            }))
          }
          icon={<IconBuildingSkyscraper size={18} />}
          title={t`Agency Branding`}
          enabledDescription={t`Including agency logo and name`}
          disabledDescription={t`Excluding agency branding`}
          unavailableDescription={t`No agency details available`}
        />

        <PublisherOption
          isSelected={config.showPublisherEmail}
          isAvailable={hasAgencyEmail}
          onClick={() =>
            setConfig((prev) => ({
              ...prev,
              showPublisherEmail: !prev.showPublisherEmail,
            }))
          }
          icon={<IconMail size={18} />}
          title={t`Contact Email`}
          enabledDescription={t`Including agency email address`}
          disabledDescription={t`Excluding email contact details`}
          unavailableDescription={t`No email contact available`}
        />

        <PublisherOption
          isSelected={config.showPublisherPhone}
          isAvailable={hasAgencyPhone}
          onClick={() =>
            setConfig((prev) => ({
              ...prev,
              showPublisherPhone: !prev.showPublisherPhone,
            }))
          }
          icon={<IconPhone size={18} />}
          title={t`Contact Phone`}
          enabledDescription={t`Including agency phone number`}
          disabledDescription={t`Excluding phone contact details`}
          unavailableDescription={t`No phone contact available`}
        />
      </StyledOptionsGroup>
    </>
  );
};

// Props for flyer content options
type FlyerContentOptionsProps<T extends PdfBaseConfiguration> = {
  config: T & { showAllImages: boolean; includeFeatures: boolean };
  setConfig: ConfigUpdateFunction<
    T & { showAllImages: boolean; includeFeatures: boolean }
  >;
  availability: AvailabilityChecks;
};

// Component for flyer content options
export const FlyerContentOptions = <T extends PdfBaseConfiguration>({
  config,
  setConfig,
  availability,
}: FlyerContentOptionsProps<T>) => {
  const { t } = useLingui();
  const { hasMultipleImages } = availability;

  return (
    <CollapsibleSection title={t`Content Options`}>
      <StyledOptionCardContainer>
        <StyledOptionCard
          isSelected={config.showAllImages}
          onClick={() =>
            hasMultipleImages
              ? setConfig((prev) => ({
                  ...prev,
                  showAllImages: !prev.showAllImages,
                }))
              : null
          }
          style={{
            opacity: hasMultipleImages ? 1 : 0.5,
            cursor: hasMultipleImages ? 'pointer' : 'not-allowed',
          }}
        >
          <StyledOptionIcon
            isSelected={config.showAllImages && hasMultipleImages}
          >
            <IconPhoto size={18} />
          </StyledOptionIcon>
          <StyledOptionContent>
            <StyledOptionLabel
              isSelected={config.showAllImages && hasMultipleImages}
            >
              {t`Multiple Property Images`}
            </StyledOptionLabel>
            <StyledOptionDescription>
              {!hasMultipleImages
                ? t`Not enough images available`
                : config.showAllImages
                  ? t`Showing all property images`
                  : t`Showing only the main image`}
            </StyledOptionDescription>
          </StyledOptionContent>
          {config.showAllImages && hasMultipleImages && (
            <IconCheck size={16} color="blue" />
          )}
        </StyledOptionCard>

        <StyledOptionCard
          isSelected={config.includeFeatures}
          onClick={() =>
            setConfig((prev) => ({
              ...prev,
              includeFeatures: !prev.includeFeatures,
            }))
          }
        >
          <StyledOptionIcon isSelected={config.includeFeatures}>
            <IconListCheck size={18} />
          </StyledOptionIcon>
          <StyledOptionContent>
            <StyledOptionLabel isSelected={config.includeFeatures}>
              {t`Property Features`}
            </StyledOptionLabel>
            <StyledOptionDescription>
              {config.includeFeatures
                ? t`Including property features`
                : t`Excluding property features`}
            </StyledOptionDescription>
          </StyledOptionContent>
          {config.includeFeatures && <IconCheck size={16} color="blue" />}
        </StyledOptionCard>
      </StyledOptionCardContainer>
    </CollapsibleSection>
  );
};

// Props for documentation content options
type DocumentationContentOptionsProps<T extends PdfBaseConfiguration> = {
  config: T & { showAddressMap: boolean; showAdditionalDocuments: boolean };
  setConfig: ConfigUpdateFunction<
    T & { showAddressMap: boolean; showAdditionalDocuments: boolean }
  >;
};

// Component for documentation content options
export const DocumentationContentOptions = <T extends PdfBaseConfiguration>({
  config,
  setConfig,
}: DocumentationContentOptionsProps<T>) => {
  const { t } = useLingui();

  return (
    <CollapsibleSection title={t`Content Options`}>
      <StyledOptionCardContainer>
        <StyledOptionCard
          isSelected={config.showAddressMap}
          onClick={() =>
            setConfig((prev) => ({
              ...prev,
              showAddressMap: !prev.showAddressMap,
            }))
          }
        >
          <StyledOptionIcon isSelected={config.showAddressMap}>
            <IconPhoto size={18} />
          </StyledOptionIcon>
          <StyledOptionContent>
            <StyledOptionLabel isSelected={config.showAddressMap}>
              {t`Show Address Map`}
            </StyledOptionLabel>
            <StyledOptionDescription>
              {config.showAddressMap
                ? t`Including location map`
                : t`Excluding location map`}
            </StyledOptionDescription>
          </StyledOptionContent>
          {config.showAddressMap && <IconCheck size={16} color="blue" />}
        </StyledOptionCard>

        <StyledOptionCard
          isSelected={config.showAdditionalDocuments}
          onClick={() =>
            setConfig((prev) => ({
              ...prev,
              showAdditionalDocuments: !prev.showAdditionalDocuments,
            }))
          }
        >
          <StyledOptionIcon isSelected={config.showAdditionalDocuments}>
            <IconListCheck size={18} />
          </StyledOptionIcon>
          <StyledOptionContent>
            <StyledOptionLabel isSelected={config.showAdditionalDocuments}>
              {t`Include Documents`}
            </StyledOptionLabel>
            <StyledOptionDescription>
              {config.showAdditionalDocuments
                ? t`Including property documents`
                : t`Excluding property documents`}
            </StyledOptionDescription>
          </StyledOptionContent>
          {config.showAdditionalDocuments && (
            <IconCheck size={16} color="blue" />
          )}
        </StyledOptionCard>
      </StyledOptionCardContainer>
    </CollapsibleSection>
  );
};
