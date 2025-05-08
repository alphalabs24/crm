import styled from '@emotion/styled';
import { lazy, ReactElement, Suspense, useRef, useState } from 'react';
import { IconButton, IconDownload, IconX } from 'twenty-ui';

import { DropZone } from '@/activities/files/components/DropZone';
import { useUploadAttachmentFile } from '@/activities/files/hooks/useUploadAttachmentFile';
import { Attachment } from '@/activities/files/types/Attachment';
import { downloadFile } from '@/activities/files/utils/downloadFile';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { isAttachmentPreviewEnabledState } from '@/client-config/states/isAttachmentPreviewEnabledState';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useRecoilValue } from 'recoil';

import { ActivityList } from '@/activities/components/ActivityList';
import { AttachmentRow } from './AttachmentRow';
import {
  DocumentViewerModal,
  DocumentViewerModalRef,
} from '~/ui/documents/document-viewer-modal/components/DocumentViewerModal';

type AttachmentListProps = {
  targetableObject: ActivityTargetableObject;
  title: string;
  attachments: Attachment[];
  button?: ReactElement | false;
};

const StyledContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(2, 6, 6)};
  width: calc(100% - ${({ theme }) => theme.spacing(12)});
  height: 100%;
`;

const StyledTitleBar = styled.h3`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  place-items: center;
  width: 100%;
`;

const StyledTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledCount = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledDropZoneContainer = styled.div`
  height: 100%;
  width: 100%;
  overflow: auto;
`;

export const AttachmentList = ({
  targetableObject,
  title,
  attachments,
  button,
}: AttachmentListProps) => {
  const { uploadAttachmentFile } = useUploadAttachmentFile();
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const isAttachmentPreviewEnabled = useRecoilValue(
    isAttachmentPreviewEnabledState,
  );
  const documentViewerModalRef = useRef<DocumentViewerModalRef>(null);

  const onUploadFile = async (file: File) => {
    await uploadAttachmentFile(file, targetableObject);
  };

  const handlePreview = (attachment: Attachment) => {
    if (!isAttachmentPreviewEnabled) return;
    documentViewerModalRef.current?.open({
      name: attachment.name,
      url: attachment.fullPath,
    });
  };

  return (
    <>
      {attachments && attachments.length > 0 && (
        <StyledContainer>
          <StyledTitleBar>
            <StyledTitle>
              {title} <StyledCount>{attachments.length}</StyledCount>
            </StyledTitle>
            {button}
          </StyledTitleBar>
          <StyledDropZoneContainer onDragEnter={() => setIsDraggingFile(true)}>
            {isDraggingFile ? (
              <DropZone
                setIsDraggingFile={setIsDraggingFile}
                onUploadFile={onUploadFile}
              />
            ) : (
              <ActivityList>
                {attachments.map((attachment) => (
                  <AttachmentRow
                    key={attachment.id}
                    attachment={attachment}
                    onPreview={
                      isAttachmentPreviewEnabled ? handlePreview : undefined
                    }
                  />
                ))}
              </ActivityList>
            )}
          </StyledDropZoneContainer>
        </StyledContainer>
      )}
      {isAttachmentPreviewEnabled && (
        <DocumentViewerModal ref={documentViewerModalRef} />
      )}
    </>
  );
};
