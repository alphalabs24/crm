import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

// These objects from creation. They should never be created by a user.
export const BLOCKED_OBJECTS_FROM_CREATION: string[] = [
  CoreObjectNameSingular.Publication,
];
