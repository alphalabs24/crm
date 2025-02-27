import { useEffect, useState } from 'react';

export const useSubcategoryByCategory = (category?: string) => {
  const [subType, setSubType] = useState<string | undefined>(undefined);

  useEffect(() => {
    switch (category?.toLowerCase()) {
      case 'house':
        setSubType('houseSubtype');
        break;
      case 'apartment':
        setSubType('apartmentSubtype');
        break;
      case 'plot':
        setSubType('plotSubtype');
        break;
      case 'property':
        setSubType('propertySubtype');
        break;
      case 'gastronomy':
        setSubType('gastronomySubtype');
        break;
      case 'industrial':
        setSubType('industrialSubtype');
        break;
      default:
        break;
    }
  }, [category]);

  return subType;
};
