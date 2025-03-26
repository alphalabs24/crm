import { registerEnumType } from '@nestjs/graphql';

export enum FileFolder {
  ProfilePicture = 'profile-picture',
  WorkspaceLogo = 'workspace-logo',
  Attachment = 'attachment',
  PersonPicture = 'person-picture',
  ServerlessFunction = 'serverless-function',
  Public = 'public',
}

registerEnumType(FileFolder, {
  name: 'FileFolder',
});
