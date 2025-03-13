import { isPropertyOrPublication } from '@/object-metadata/utils/isPropertyOrPublication';

export const getBasePathToShowPage = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  if (isPropertyOrPublication(objectNameSingular)) {
    return `/details/${objectNameSingular}/`;
  }

  const basePathToShowPage = `/object/${objectNameSingular}/`;

  return basePathToShowPage;
};
