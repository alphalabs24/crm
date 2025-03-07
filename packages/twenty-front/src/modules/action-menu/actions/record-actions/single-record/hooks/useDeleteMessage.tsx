import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isProperty } from '@/object-metadata/utils/isPropertyOrPublication';
import { Trans, useLingui } from '@lingui/react/macro';
import { capitalize } from 'twenty-shared';

export const useDeleteMessage = (objectMetadataItem: ObjectMetadataItem) => {
  const { t } = useLingui();
  const objectNameSingularCapitalized = capitalize(
    objectMetadataItem.nameSingular,
  );

  if (isProperty(objectMetadataItem.nameSingular)) {
    return (
      <Trans>
        Are you sure you want to delete this {objectNameSingularCapitalized}?{' '}
        <strong>All it's publications will be deleted as well.</strong>
      </Trans>
    );
  }

  return t`Are you sure you want to delete this ${objectNameSingularCapitalized}?`;
};
