import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const usePropertyOfPublication = ({
  publication,
}: {
  publication: ObjectRecord | null;
}) => {
  const { record: property } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.Property,
    objectRecordId: publication?.propertyId ?? '',
  });

  return property;
};
