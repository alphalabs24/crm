import { Modal, ModalRefType } from '@/ui/layout/modal/components/Modal';
import styled from '@emotion/styled';
import {
  IconButton,
  IconDownload,
  IconFileText,
  IconX,
  MOBILE_VIEWPORT,
} from 'twenty-ui';
import {
  forwardRef,
  useImperativeHandle,
  useState,
  Suspense,
  lazy,
  useCallback,
} from 'react';
import { downloadFile } from '@/activities/files/utils/downloadFile';

const DocumentViewer = lazy(() =>
  import('@/activities/files/components/DocumentViewer').then((module) => ({
    default: module.DocumentViewer,
  })),
);

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;

  padding: ${({ theme }) => theme.spacing(3)};
  row-gap: ${({ theme }) => theme.spacing(2)};
  flex-wrap: wrap;

  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: ${({ theme }) => theme.background.primary};

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    padding: ${({ theme }) => theme.spacing(4)};
  }
`;

const StyledModalTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  flex: 1;
  min-width: 0;
`;

const StyledTitleContainer = styled.div`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: calc(100% - 35px); /* Subtract the icon width and gap */
`;

const StyledButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledLoadingContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  display: flex;
  height: 80vh;
  justify-content: center;
  width: 100%;
`;

const StyledLoadingText = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

export type DocumentViewerModalProps = {
  loadingText?: string;
};

export type DocumentViewerModalRef = {
  open: (documentInfo: { name: string; url: string }) => void;
  close: () => void;
};

export const DocumentViewerModal = forwardRef<
  DocumentViewerModalRef,
  DocumentViewerModalProps
>(({ loadingText = 'Loading document viewer...' }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [documentInfo, setDocumentInfo] = useState<{
    name: string;
    url: string;
  } | null>(null);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setDocumentInfo(null);
  }, []);

  const handleDownload = (fullPath: string, name: string) => {
    if (!fullPath) return;

    downloadFile(fullPath, name);
  };

  useImperativeHandle(
    ref,
    () => ({
      open: (docInfo: { name: string; url: string }) => {
        setDocumentInfo(docInfo);
        setIsOpen(true);
      },
      close: handleClose,
    }),
    [handleClose],
  );

  if (!isOpen || !documentInfo) {
    return null;
  }

  return (
    <Modal size="large" isClosable onClose={handleClose} portal padding="none">
      <StyledHeader>
        <StyledModalTitle>
          <IconFileText size={20} />
          <StyledTitleContainer>{documentInfo.name}</StyledTitleContainer>
        </StyledModalTitle>
        <StyledButtonContainer>
          <IconButton
            Icon={IconDownload}
            onClick={() => handleDownload(documentInfo.url, documentInfo.name)}
            size="small"
          />
          <IconButton Icon={IconX} onClick={handleClose} size="small" />
        </StyledButtonContainer>
      </StyledHeader>

      <Suspense
        fallback={
          <StyledLoadingContainer>
            <StyledLoadingText>{loadingText}</StyledLoadingText>
          </StyledLoadingContainer>
        }
      >
        <DocumentViewer
          documentName={documentInfo.name}
          documentUrl={documentInfo.url}
        />
      </Suspense>
    </Modal>
  );
});
