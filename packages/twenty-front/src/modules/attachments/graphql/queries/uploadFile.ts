import { gql } from '@apollo/client';

export const UPLOAD_FILE = gql`
  mutation uploadFile(
    $file: Upload!
    $fileFolder: FileFolder
    $isPublic: Boolean
  ) {
    uploadFile(file: $file, fileFolder: $fileFolder, isPublic: $isPublic)
  }
`;
