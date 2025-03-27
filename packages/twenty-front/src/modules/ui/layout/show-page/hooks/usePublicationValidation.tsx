import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useLingui } from '@lingui/react/macro';
import { ReactNode, useMemo } from 'react';

export type ValidationResult = {
  isValid: boolean;
  missingFields: ReactNode[];
  message?: string;
};

export type PublicationValidationState = {
  canPublish: boolean;
  canCreatePublication: boolean;
  showPublishButton: boolean;
  validationDetails: ValidationResult;
};

export const usePublicationValidation = ({
  record,
  isPublication = false,
}: {
  record?: ObjectRecord | null;
  isPublication?: boolean;
}): PublicationValidationState => {
  const { t } = useLingui();
  const validationDetails = useMemo((): ValidationResult => {
    if (!record) {
      return {
        isValid: false,
        missingFields: ['record'],
        message: 'No record found',
      };
    }

    const MANDATORY_BASE_FIELDS_SHARED = [
      ['category', t`Category`],
      ['offerType', t`Offer Type`],
      ['refProperty', t`Reference Property`],
    ] as const;

    const MANDATORY_BASE_FIELDS_PUBLICATION = [
      ...MANDATORY_BASE_FIELDS_SHARED,
      ['platform', t`Platform`],
    ] as const;

    const MANDATORY_ADDRESS_FIELDS = [
      ['addressStreet1', t`Address Street 1`],
      ['addressPostcode', t`Address Postcode`],
      ['addressCity', t`Address City`],
      ['addressState', t`Address State`],
      ['addressCountry', t`Address Country`],
    ] as const;

    const CATEGORY_SUBTYPE_MAP = {
      APARTMENT: ['apartmentSubtype', t`Apartment Subtype`],
      GASTRONOMY: ['gastronomySubtype', t`Gastronomy Subtype`],
      HOUSE: ['houseSubtype', t`House Subtype`],
      PLOT: ['plotSubtype', t`Plot Subtype`],
      SECONDARY_ROOMS: ['secondaryRoomsSubtype', t`Secondary Rooms Subtype`],
      AGRICULTURE: ['agricultureSubtype', t`Agriculture Subtype`],
      INDUSTRIAL_OBJECTS: ['industrialSubtype', t`Industrial Subtype`],
    } as const;

    const missingFields: ReactNode[] = [];

    // Check base mandatory fields
    if (isPublication) {
      MANDATORY_BASE_FIELDS_PUBLICATION.forEach(([field, label]) => {
        if (!record[field]) {
          missingFields.push(label);
        }
      });
    } else {
      MANDATORY_BASE_FIELDS_SHARED.forEach(([field, label]) => {
        if (!record[field]) {
          missingFields.push(label);
        }
      });
    }

    // Check address fields if address exists
    const address = record.address;
    if (address) {
      MANDATORY_ADDRESS_FIELDS.forEach(([field, label]) => {
        if (!address[field]) {
          missingFields.push(label);
        }
      });
    } else {
      missingFields.push(t`Address`);
    }

    // Check category-specific subtype
    const category = record.category;
    if (category && category in CATEGORY_SUBTYPE_MAP) {
      const [requiredSubtype, label] =
        CATEGORY_SUBTYPE_MAP[category as keyof typeof CATEGORY_SUBTYPE_MAP];
      if (!record[requiredSubtype]) {
        missingFields.push(label);
      }
    }

    // Check platform-specific requirements
    if (record.platform?.toLowerCase() === 'newhome') {
      if (
        !record.agency?.newhomeFtpUser ||
        !record.agency?.newhomeFtpPassword
      ) {
        missingFields.push(t`Publisher Credentials`);
      }
    }

    const missingFieldsString = missingFields.join(', ');
    return {
      isValid: missingFields.length === 0,
      missingFields,
      message: missingFields.length
        ? t`Missing required fields: ${missingFieldsString}`
        : undefined,
    };
  }, [isPublication, record, t]);

  const showPublishButton = useMemo(() => {
    if (!record) return false;
    if (!isPublication) return true; // Always show for properties

    if (record.stage === 'PUBLISHED') return false;
    if (record.stage === 'SCHEDULED') return false;
    return true;
  }, [record, isPublication]);

  const canPublish = useMemo(
    () => validationDetails.isValid && showPublishButton,
    [validationDetails.isValid, showPublishButton],
  );

  const canCreatePublication = useMemo(
    () => !isPublication && validationDetails.isValid,
    [isPublication, validationDetails.isValid],
  );

  return {
    canPublish,
    canCreatePublication,
    showPublishButton,
    validationDetails,
  };
};
