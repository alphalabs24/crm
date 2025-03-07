import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

export const isPropertyOrPublication = (objectNameSingular: string) => {
  return (
    objectNameSingular === CoreObjectNameSingular.Property ||
    objectNameSingular === CoreObjectNameSingular.Publication
  );
};

export const isProperty = (objectNameSingular: string) => {
  return objectNameSingular === CoreObjectNameSingular.Property;
};

export const isPublication = (objectNameSingular: string) => {
  return objectNameSingular === CoreObjectNameSingular.Publication;
};
