import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  IconComponent,
  IconFile,
  IconFileText,
  IconFileZip,
  IconHeadphones,
  IconPhoto,
  IconPresentation,
  IconTable,
  IconVideo,
  IconFileDescription,
} from 'twenty-ui';

import { AttachmentType } from '@/activities/files/types/Attachment';

const StyledIconContainer = styled.div<{ background: string }>`
  align-items: center;
  background: ${({ background }) => background};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.grayScale.gray0};
  display: flex;
  flex-shrink: 0;
  height: 20px;
  justify-content: center;
  width: 20px;
`;

const IconMapping: { [key in AttachmentType]: IconComponent } = {
  Archive: IconFileZip,
  Audio: IconHeadphones,
  Image: IconPhoto,
  Presentation: IconPresentation,
  Spreadsheet: IconTable,
  TextDocument: IconFileText,
  Video: IconVideo,
  Other: IconFile,
  PropertyImage: IconPhoto,
  PropertyDocument: IconFile,
  PropertyVideo: IconVideo,
  PropertyDocumentation: IconFileText,
  PropertyFlyer: IconFileDescription,
};

export const AttachmentIcon = ({
  attachmentType,
}: {
  attachmentType: AttachmentType;
}) => {
  const theme = useTheme();

  const IconColors: { [key in AttachmentType]: string } = {
    Archive: theme.color.gray,
    Audio: theme.color.gray,
    Image: theme.color.gray,
    Presentation: theme.color.gray,
    Spreadsheet: theme.color.gray,
    TextDocument: theme.color.gray,
    Video: theme.color.gray,
    Other: theme.color.gray,
    PropertyImage: theme.color.yellow,
    PropertyDocument: theme.color.blue,
    PropertyVideo: theme.color.purple,
    PropertyDocumentation: theme.color.turquoise,
    PropertyFlyer: theme.color.orange,
  };

  const Icon = IconMapping[attachmentType];

  return (
    <StyledIconContainer background={IconColors[attachmentType]}>
      {Icon && <Icon size={theme.icon.size.sm} />}
    </StyledIconContainer>
  );
};
