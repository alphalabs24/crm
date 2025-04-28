import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import '@cyntler/react-doc-viewer/dist/index.css';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Trans } from '@lingui/react/macro';
import { IconLoader, IconAlertTriangle } from 'twenty-ui';
import { useState, useEffect } from 'react';

const StyledPreviewContainer = styled.div`
  width: 100%;
  max-width: 300px;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  overflow: hidden;
  background: ${({ theme }) => theme.background.secondary};

  .react-doc-viewer {
    height: 200px;
    width: 100%;
    overflow: auto;
    background: none;
  }

  #react-doc-viewer #header-bar {
    display: none;
  }

  #react-doc-viewer #pdf-controls {
    display: none !important;
  }
`;

const StyledLoadingContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex-direction: column;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  min-height: 200px;
  padding: ${({ theme }) => theme.spacing(2)};
  text-align: center;
  width: 100%;
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
  align-items: center;
  color: ${({ theme }) => theme.color.red};
  display: flex;
  flex-direction: column;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  min-height: 200px;
  padding: ${({ theme }) => theme.spacing(2)};
  text-align: center;
`;

interface PdfPreviewProps {
  url: string;
}

export const PdfPreview = ({ url }: PdfPreviewProps) => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Check if URL is empty, undefined, or not a string
    if (!url || typeof url !== 'string') {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    const checkUrl = async () => {
      try {
        // Try to validate the URL
        const isValidUrl =
          url.startsWith('http://') ||
          url.startsWith('https://') ||
          url.startsWith('blob:') ||
          url.startsWith('data:') ||
          url.startsWith('/');

        if (!isValidUrl) {
          setHasError(true);
          setIsLoading(false);
          return;
        }

        // For HTTP/HTTPS URLs, check if they're accessible
        if (url.startsWith('http')) {
          const response = await fetch(url, { method: 'HEAD' });
          if (!response.ok) {
            setHasError(true);
          }
        }
      } catch (error) {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkUrl();
  }, [url]);

  if (hasError) {
    return (
      <StyledPreviewContainer>
        <StyledErrorContainer>
          <IconAlertTriangle size={24} />
          <Trans>Error loading document</Trans>
        </StyledErrorContainer>
      </StyledPreviewContainer>
    );
  }

  if (isLoading) {
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

  // Determine if the URL is a PDF by checking the extension or URL pattern
  const isPdf =
    url.toLowerCase().endsWith('.pdf') ||
    url.toLowerCase().includes('pdf') ||
    url.toLowerCase().includes('application/pdf');

  // Get the filename from the URL if possible
  const fileName = url.split('/').pop() || 'preview.pdf';

  return (
    <StyledPreviewContainer>
      <DocViewer
        documents={[
          {
            uri: url,
            fileName: fileName,
            fileType: isPdf ? 'application/pdf' : undefined,
          },
        ]}
        pluginRenderers={DocViewerRenderers}
        style={{ height: '100%' }}
        config={{
          header: {
            disableHeader: true,
            disableFileName: true,
            retainURLParams: false,
          },
          pdfVerticalScrollByDefault: true,
          pdfZoom: {
            defaultZoom: 1,
            zoomJump: 0.1,
          },
        }}
        theme={{
          primary: theme.background.primary,
          secondary: theme.background.secondary,
          tertiary: theme.background.tertiary,
          textPrimary: theme.font.color.primary,
          textSecondary: theme.font.color.secondary,
          textTertiary: theme.font.color.tertiary,
          disableThemeScrollbar: true,
        }}
      />
    </StyledPreviewContainer>
  );
};
