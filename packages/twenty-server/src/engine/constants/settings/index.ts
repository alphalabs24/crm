import { Settings } from './interfaces/settings.interface';

export const settings: Settings = {
  storage: {
    imageCropSizes: {
      'profile-picture': ['original'],
      'workspace-logo': ['original'],
      'person-picture': ['original'],
    },
    // also update nginx config in nestermind-platform/docker-compose.yml
    maxFileSize: '25MB',
  },
  minLengthOfStringForDuplicateCheck: 3,
  maxVisibleViewFields: 30,
};
