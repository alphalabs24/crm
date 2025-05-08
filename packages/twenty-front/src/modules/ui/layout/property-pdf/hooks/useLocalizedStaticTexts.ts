import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { LocalizedStaticPdfTextsType } from '../types/types';

export const useLocalizedStaticTexts = ({
  type,
}: {
  type: 'PropertyFlyer' | 'PropertyDocumentation';
}) => {
  const { t } = useLingui();

  const isFlyer = useMemo(() => type === 'PropertyFlyer', [type]);
  const localizedStaticTexts: LocalizedStaticPdfTextsType = useMemo(() => {
    if (isFlyer) {
      return {
        descriptionTitle: t`About the property`,
        fieldsTitle: t`Characteristics`,
      };
    }

    return {
      descriptionTitle: t`About the property`,
      fieldsTitle: t`Property Details`,
      tableOfContentsTitle: t`Table of Contents`,
      locationTitle: t`Location & surroundings`,
      featuresTitle: t`Features and amenities`,
      priceTitle: t`Price details`,
      spaceTitle: t`Area & Masses`,
      furtherDetailsTitle: t`Additional Details`,
      propertyDetailsTitle: t`Property Details`,
      galleryTitle: t`Gallery`,
      floorplanTitle: t`Floorplan`,
      additionalDocumentsTitle: t`Additional Documents`,
    };
  }, [isFlyer, t]);

  return localizedStaticTexts;
};
