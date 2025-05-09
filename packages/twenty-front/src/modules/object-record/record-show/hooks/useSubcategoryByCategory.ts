import { CATEGORY_SUBTYPES } from '@/record-edit/constants/CategorySubtypes';
import { useEffect, useState } from 'react';

export const useSubcategoryByCategory = (category?: string) => {
  const [subType, setSubType] = useState<string | undefined>(undefined);

  useEffect(() => {
    switch (category?.toLowerCase()) {
      case 'house':
        setSubType(CATEGORY_SUBTYPES.HOUSE);
        break;
      case 'apartment':
        setSubType(CATEGORY_SUBTYPES.APARTMENT);
        break;
      case 'plot':
        setSubType(CATEGORY_SUBTYPES.PLOT);
        break;
      case 'property':
        setSubType(CATEGORY_SUBTYPES.PROPERTY);
        break;
      case 'gastronomy':
        setSubType(CATEGORY_SUBTYPES.GASTRONOMY);
        break;
      case 'secondaryRooms':
        setSubType(CATEGORY_SUBTYPES.SECONDARY_ROOMS);
        break;
      case 'agriculture':
        setSubType(CATEGORY_SUBTYPES.AGRICULTURE);
        break;
      case 'industrialObjects':
        setSubType(CATEGORY_SUBTYPES.INDUSTRIAL_OBJECTS);
        break;
      case 'parkingSpace':
        setSubType(CATEGORY_SUBTYPES.PARKING_SPACE);
        break;
      default:
        break;
    }
  }, [category]);

  return subType;
};
