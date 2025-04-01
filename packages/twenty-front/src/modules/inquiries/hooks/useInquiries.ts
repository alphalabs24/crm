import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';

import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';

import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useMemo } from 'react';

export const useInquiries = () => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.BuyerLead,
  });

  const recordGqlFields = useMemo(() => {
    if (!objectMetadataItem) return undefined;
    return generateDepthOneRecordGqlFields({ objectMetadataItem });
  }, [objectMetadataItem]);

  const { records } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.BuyerLead,
    recordGqlFields,
    skip: !objectMetadataItem,
  });

  return { records };
};
