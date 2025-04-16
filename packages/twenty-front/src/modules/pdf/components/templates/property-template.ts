import { useFormattedPropertyFields } from '@/object-record/hooks/useFormattedPropertyFields';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { Attachment } from '@/activities/files/types/Attachment';

export const generatePropertyPdfTemplate = (
  property?: ObjectRecord,
  formatField?: ReturnType<typeof useFormattedPropertyFields>['formatField'],
) => {
  const theme = {
    colors: {
      gray900: '#111827',
      gray700: '#374151',
      gray600: '#4B5563',
      gray500: '#6B7280',
      gray200: '#E5E7EB',
      gray100: '#F3F4F6',
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
    },
    typography: {
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '24px',
    },
    borderRadius: {
      sm: '4px',
    },
  };

  const propertyImages =
    property?.attachments
      ?.filter((attachment: Attachment) => attachment.type === 'PropertyImage')
      .sort((a: Attachment, b: Attachment) => a.orderIndex - b.orderIndex)
      .slice(0, 4) || [];

  const mainImage = propertyImages[0]?.fullPath;
  const secondaryImages = propertyImages.slice(1, 4);

  const formattedFeatures =
    property?.features?.map((feature: string) =>
      formatField?.('features', feature),
    ) || [];

  if (!property) return '';

  return `
    <html>
      <head>
        <style>
          @page {
            size: A4;
            margin: 0;
          }

          body {
            font-family: sans-serif;
            color: ${theme.colors.gray900};
            margin: 0;
            padding: ${theme.spacing.lg};
            max-width: 210mm;
            min-height: 297mm;
          }

          .header {
            font-size: ${theme.typography.xl};
            font-weight: bold;
            margin-bottom: ${theme.spacing.sm};
          }

          .subheader {
            font-size: ${theme.typography.base};
            color: ${theme.colors.gray600};
            margin-bottom: ${theme.spacing.lg};
          }

          .main-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            margin-bottom: ${theme.spacing.md};
          }

          .secondary-images {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: ${theme.spacing.md};
            margin-bottom: ${theme.spacing.lg};
          }

          .secondary-images img {
            width: 100%;
            height: 100px;
            object-fit: cover;
          }

          .description {
            font-size: ${theme.typography.base};
            color: ${theme.colors.gray700};
            margin-bottom: ${theme.spacing.lg};
            display: -webkit-box;
            -webkit-line-clamp: 6;
            -webkit-box-orient: vertical;
            overflow: hidden;
            line-height: 1.4;
          }

          .features {
            margin-bottom: ${theme.spacing.lg};
          }

          .feature {
            display: inline-block;
            background-color: ${theme.colors.gray200};
            color: ${theme.colors.gray700};
            padding: ${theme.spacing.xs} ${theme.spacing.sm};
            margin-right: ${theme.spacing.sm};
            margin-bottom: ${theme.spacing.sm};
            font-size: ${theme.typography.sm};
          }

          .address {
            font-size: ${theme.typography.sm};
            color: ${theme.colors.gray500};
            border-top: 1px solid ${theme.colors.gray200};
            padding-top: ${theme.spacing.md};
          }
        </style>
      </head>
      <body>
        <div class="header">${property.name}</div>
        <div class="subheader">${property.address?.addressStreet1}, ${property.address?.addressPostcode} ${property.address?.addressCity}</div>
        ${mainImage ? `<img class="main-image" src="${mainImage}" />` : ''}
        ${
          secondaryImages.length > 0
            ? `<div class="secondary-images">
              ${secondaryImages
                .map(
                  (img: Attachment) =>
                    `<img src="${img.fullPath}" alt="Property Image" />`,
                )
                .join('')}
            </div>`
            : ''
        }
        <div class="description">${property.description}</div>
        ${
          formattedFeatures.length > 0
            ? `<div class="features">
              ${formattedFeatures
                .map((f: string) => `<span class="feature">${f}</span>`)
                .join('')}
            </div>`
            : ''
        }
        <div class="address">Listed by ${property.agency?.name} – ${property.agency?.email?.primaryEmail}</div>
      </body>
    </html>
  `;
};
