import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import {
  IconAlertTriangle,
  IconLoader,
  IconChevronLeft,
  IconChevronRight,
} from 'twenty-ui';

// Ensure worker is set up properly so no race condition is happening
let workerInitialized = false;

try {
  if (!workerInitialized) {
    // Set up pdf.js worker
    // https://github.com/wojtekmaj/react-pdf/blob/main/packages/react-pdf/README.md#copy-worker-to-public-directory
    // download the worker from here
    // https://unpkg.com/pdfjs-dist@4.3.136/build/pdf.worker.min.mjs
    pdfjs.GlobalWorkerOptions.workerSrc = '/assets/pdfjs-worker.min.js';
    workerInitialized = true;
  }
} catch (error) {
  console.error('Error initializing PDF.js worker:', error);
}

interface PdfPreviewProps {
  url: string;
}

// Styled components
const StyledPreviewContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  padding: ${({ theme }) => theme.spacing(4)};
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  width: 100%;
  min-height: 320px;
  gap: ${({ theme }) => theme.spacing(2)};
  position: relative;
`;

const StyledLoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
  min-height: 200px;
`;

const StyledSpinner = styled.div`
  animation: spin 1s linear infinite;
  color: ${({ theme }) => theme.font.color.tertiary};

  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
`;

const StyledErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.color.red};
  min-height: 200px;
`;

const StyledPageControls = styled.div<{ $visible: boolean }>`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(1)};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
  transition: opacity 0.3s ease;
`;

const StyledPageButton = styled.button<{ disabled: boolean }>`
  align-items: center;
  background: ${({ theme, disabled }) =>
    disabled ? theme.background.tertiary : theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme, disabled }) =>
    disabled ? theme.font.color.light : theme.font.color.primary};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(0.5)};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

const StyledPageIndicator = styled.div`
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.secondary};
  padding: 0 ${({ theme }) => theme.spacing(1)};
`;

export const PdfPreview = ({ url }: PdfPreviewProps) => {
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasError, setHasError] = useState(false);
  const [isWorkerReady, setIsWorkerReady] = useState(false);

  // Check if worker is properly initialized before fetching PDF
  useEffect(() => {
    const checkWorker = async () => {
      if (!workerInitialized) {
        try {
          // Try to reinitialize worker if it failed before
          // https://github.com/wojtekmaj/react-pdf/blob/main/packages/react-pdf/README.md#copy-worker-to-public-directory
          // download the worker from here
          // https://unpkg.com/pdfjs-dist@4.3.136/build/pdf.worker.min.mjs
          pdfjs.GlobalWorkerOptions.workerSrc = '/assets/pdfjs-worker.min.js';
          workerInitialized = true;
        } catch (error) {
          console.error('Error reinitializing PDF.js worker:', error);
          setHasError(true);
          return;
        }
      }

      setIsWorkerReady(true);
    };

    checkWorker();
  }, []);

  useEffect(() => {
    // Only fetch PDF if worker is ready
    if (!isWorkerReady || !url) return;

    const fetchPdf = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch PDF');
        const blob = await response.blob();
        setPdfBlob(blob);
      } catch (error) {
        console.error('Error fetching PDF:', error);
        setHasError(true);
      }
    };

    fetchPdf();
  }, [url, isWorkerReady]);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (hasError) {
    return (
      <StyledPreviewContainer>
        <StyledErrorContainer>
          <IconAlertTriangle size={24} />
          <Trans>Error loading PDF</Trans>
        </StyledErrorContainer>
      </StyledPreviewContainer>
    );
  }

  if (!isWorkerReady || !pdfBlob) {
    return (
      <StyledPreviewContainer>
        <StyledLoadingContainer>
          <StyledSpinner>
            <IconLoader size={24} />
          </StyledSpinner>
          <Trans>Loading document...</Trans>
        </StyledLoadingContainer>
      </StyledPreviewContainer>
    );
  }

  return (
    <StyledPreviewContainer>
      <Document
        file={pdfBlob}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        onLoadError={(error) => {
          console.error('Error loading PDF document:', error);
          setHasError(true);
        }}
        loading={
          <StyledLoadingContainer>
            <StyledSpinner>
              <IconLoader size={24} />
            </StyledSpinner>
            <Trans>Loading document...</Trans>
          </StyledLoadingContainer>
        }
        error={<StyledErrorContainer>Error loading PDF</StyledErrorContainer>}
      >
        {numPages > 0 && (
          <Page pageNumber={currentPage} width={200} height={320} />
        )}
      </Document>

      <StyledPageControls $visible={numPages > 1}>
        <StyledPageButton
          onClick={goToPreviousPage}
          disabled={currentPage <= 1}
        >
          <IconChevronLeft size={16} />
        </StyledPageButton>
        <StyledPageIndicator>
          {currentPage} / {numPages}
        </StyledPageIndicator>
        <StyledPageButton
          onClick={goToNextPage}
          disabled={currentPage >= numPages}
        >
          <IconChevronRight size={16} />
        </StyledPageButton>
      </StyledPageControls>
    </StyledPreviewContainer>
  );
};
