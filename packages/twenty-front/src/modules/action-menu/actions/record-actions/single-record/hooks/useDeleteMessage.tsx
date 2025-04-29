import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isProperty } from '@/object-metadata/utils/isPropertyOrPublication';
import { Trans, useLingui } from '@lingui/react/macro';

export const useDeleteMessage = (objectMetadataItem: ObjectMetadataItem) => {
  const { t } = useLingui();
  const label = objectMetadataItem.labelSingular;

  if (isProperty(objectMetadataItem.nameSingular)) {
    return (
      <Trans>
        Are you sure you want to delete this {label}?{' '}
        <strong>All it's publications will be deleted as well.</strong>
      </Trans>
    );
  }

  return t`Are you sure you want to delete this ${label}?`;
};
