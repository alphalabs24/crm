import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { PREVIEWABLE_EXTENSIONS } from '@/activities/files/components/DocumentViewer';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { Section } from '@/object-record/record-show/components/ui/PropertyDetailsCardComponents';
import { usePropertyDocuments } from '@/ui/layout/show-page/hooks/usePropertyDocuments';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';

import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { useCallback, useRef } from 'react';
import {
  IconFile,
  IconFileText,
  IconDownload,
  IconExternalLink,
  MOBILE_VIEWPORT,
  IconDotsVertical,
  MenuItem,
} from 'twenty-ui';
import {
  DocumentViewerModal,
  DocumentViewerModalRef,
} from '~/ui/documents/document-viewer-modal/components/DocumentViewerModal';
import { downloadFile } from '@/activities/files/utils/downloadFile';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledDocumentGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledDocumentGroupTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StyledDocumentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledDocumentItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(2)};
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.border.color.strong};
  }
`;

const StyledDocumentIcon = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  height: 32px;
  justify-content: center;
  width: 32px;
`;

const StyledDocumentInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledDocumentName = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDocumentDescription = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.xs};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledActionButton = styled.button`
  background: transparent;
  border: none;
  padding: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.tertiary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${({ theme }) => theme.font.color.secondary};
  }
`;

const StyledNoDocuments = styled.div`
  align-items: center;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  flex-direction: column;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)};
  text-align: center;

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    min-height: 80px;
  }
`;

type PropertyDocumentsCardProps = {
  targetableObject: Pick<
    ActivityTargetableObject,
    'targetObjectNameSingular' | 'id'
  >;
  loading?: boolean;
};

export const PropertyDocumentsCard = ({
  targetableObject,
  loading = false,
}: PropertyDocumentsCardProps) => {
  const { t } = useLingui();
  const documentViewerModalRef = useRef<DocumentViewerModalRef>(null);

  const { allDocuments, documentsByType } = usePropertyDocuments({
    id: targetableObject.id,
    targetObjectNameSingular:
      targetableObject.targetObjectNameSingular ||
      CoreObjectNameSingular.Property,
  });

  if (loading) {
    return null;
  }

  // Define document group labels
  const documentGroupLabels = {
    PropertyDocument: t`Additional Documents`,
    PropertyDocumentation: t`Property Exposé`,
    PropertyFlyer: t`Property Flyer`,
  };

  // Get file icon based on file name/extension
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return <IconFileText size={24} />;
    return <IconFile size={24} />;
  };

  // Check if document is viewable
  const isDocumentViewable = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    return PREVIEWABLE_EXTENSIONS.includes(extension as any);
  };

  // Open document viewer
  const openDocumentViewer = (doc: any) => {
    documentViewerModalRef.current?.open({
      name: doc.fileName || doc.name || 'Document',
      url: doc.fullPath,
    });
  };

  const DocumentItem = ({ document: doc }: { document: any }) => {
    const dropdownId = `document-dropdown-${doc.id}`;
    const { closeDropdown } = useDropdown(dropdownId);
    const documentName = doc.fileName || doc.name || 'Document';
    const isViewable = isDocumentViewable(documentName);

    const handleOpenDocument = useCallback(() => {
      if (isViewable) {
        openDocumentViewer(doc);
      } else if (doc.fullPath) {
        window.open(doc.fullPath, '_blank');
      }
      closeDropdown();
    }, [doc, isViewable, closeDropdown]);

    const handleDownload = (fullPath: string, name: string) => {
      if (!fullPath) return;

      downloadFile(fullPath, name);
    };

    return (
      <StyledDocumentItem onClick={handleOpenDocument}>
        <StyledDocumentIcon>{getFileIcon(documentName)}</StyledDocumentIcon>
        <StyledDocumentInfo>
          <StyledDocumentName>{documentName}</StyledDocumentName>
          <StyledDocumentDescription>
            {doc.description || ''}
          </StyledDocumentDescription>
        </StyledDocumentInfo>
        <Dropdown
          dropdownId={dropdownId}
          clickableComponent={
            <StyledActionButton>
              <IconDotsVertical size={16} />
            </StyledActionButton>
          }
          dropdownMenuWidth={160}
          dropdownComponents={
            <DropdownMenuItemsContainer>
              <MenuItem
                text={isViewable ? t`View` : t`Open`}
                LeftIcon={IconExternalLink}
                onClick={handleOpenDocument}
              />
              <MenuItem
                text={t`Download`}
                LeftIcon={IconDownload}
                onClick={() => handleDownload(doc.fullPath, documentName)}
              />
            </DropdownMenuItemsContainer>
          }
          dropdownHotkeyScope={{ scope: dropdownId }}
        />
      </StyledDocumentItem>
    );
  };

  // If no documents, show empty state
  if (!allDocuments || allDocuments.length === 0) {
    return (
      <Section title={t`Documents`} icon={<IconFileText size={16} />}>
        <StyledNoDocuments>
          <IconFileText size={24} />
          <Trans>No documents available</Trans>
        </StyledNoDocuments>
      </Section>
    );
  }

  return (
    <>
      <Section title={t`Documents`} icon={<IconFileText size={16} />}>
        <StyledContent>
          {Object.entries(documentsByType)
            .filter(
              ([type]) =>
                // For now we ignore flyer and documentation
                type !== 'PropertyDocumentation' && type !== 'PropertyFlyer',
            )
            .map(([type, documents]) => {
              if (!documents || documents.length === 0) return null;

              return (
                <StyledDocumentGroup key={type}>
                  <StyledDocumentGroupTitle>
                    {documentGroupLabels[
                      type as keyof typeof documentGroupLabels
                    ] || type}
                  </StyledDocumentGroupTitle>
                  <StyledDocumentList>
                    {documents.map((document) => (
                      <DocumentItem key={document.id} document={document} />
                    ))}
                  </StyledDocumentList>
                </StyledDocumentGroup>
              );
            })}
        </StyledContent>
      </Section>

      {/* Document Viewer Modal */}
      <DocumentViewerModal ref={documentViewerModalRef} />
    </>
  );
};
