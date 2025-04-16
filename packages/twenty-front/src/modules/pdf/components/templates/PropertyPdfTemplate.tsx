import styled from '@emotion/styled';
import ReactDOMServer from 'react-dom/server';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

const key = 'pdf';
const cache = createCache({
  key,
  // This is important for SSR
  prepend: true,
});

// Simple theme
const theme = {
  colors: {
    primary: '#111827',
    secondary: '#6B7280',
  },
  spacing: {
    base: '16px',
  },
  typography: {
    base: '16px',
  },
};

// Single styled component for testing
const StyledCard = styled.div`
  &.card {
    border: 1px solid ${theme.colors.secondary};
    padding: ${theme.spacing.base};
    color: ${theme.colors.primary};
    font-size: ${theme.typography.base};
  }
`;

type PropertyPdfTemplateProps = {
  title: string;
  description: string;
};

const PropertyPdfTemplate = ({
  title,
  description,
}: PropertyPdfTemplateProps) => {
  return (
    <StyledCard className="card">
      <h1>{title}</h1>
      <p>{description}</p>
    </StyledCard>
  );
};

export const generatePropertyPdfTemplate = (
  data: PropertyPdfTemplateProps,
): string => {
  const html = ReactDOMServer.renderToString(
    <CacheProvider value={cache}>
      <PropertyPdfTemplate title={data.title} description={data.description} />
    </CacheProvider>,
  );

  // Get styles from cache
  const styles = Object.values(cache.inserted).join('\n');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${data.title}</title>
        <style>${styles}</style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `;
};
