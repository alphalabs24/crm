import { DefaultDocumentationTemplateProps } from '@/ui/layout/property-pdf/types/types';
import { useMemo } from 'react';

// Import page components from the pages directory
import { FirstPage } from './pages/FirstPage';
import { Footer } from './pages/FooterComponent';
import { GalleryPage } from './pages/GalleryPage';
import { PropertyDetailsPage } from './pages/PropertyDetailsPage';
import { TableOfContentsPage } from './pages/TableOfContentsPage';

export const DefaultDocumentationTemplate = ({
  property,
  propertyPrice,
  propertyAddress,
  propertyImages,
  agencyLogo,
  orientation,
  fields,
  propertyFeatures,
  // Publisher configuration options with defaults
  showPublisherBranding = true,
  showPublisherEmail = true,
  showPublisherPhone = true,
  showAddressMap = false,
  showAdditionalDocuments = false,
  addressMapUrl,
  floorplanUrl,
}: DefaultDocumentationTemplateProps) => {
  // Get all images except the first one (which is used as hero image)
  const additionalImages = useMemo(() => {
    if (!propertyImages || propertyImages.length <= 1) return [];
    return propertyImages.slice(1);
  }, [propertyImages]);

  // Create gallery pages with 6 images per page
  const galleryPages = useMemo(() => {
    if (additionalImages.length === 0) return [];

    const pages = [];
    for (let i = 0; i < additionalImages.length; i += 6) {
      const imagesSubset = additionalImages.slice(i, i + 6);
      const pageIndex = Math.floor(i / 6);
      pages.push({ imagesSubset, pageIndex });
    }
    return pages;
  }, [additionalImages]);

  // Create footer component for reuse
  const footerComponent = (
    <Footer
      property={property}
      showPublisherBranding={showPublisherBranding}
      showPublisherEmail={showPublisherEmail}
      showPublisherPhone={showPublisherPhone}
    />
  );

  return (
    <>
      <FirstPage
        property={property}
        propertyPrice={propertyPrice}
        propertyAddress={propertyAddress}
        orientation={orientation}
        propertyImages={propertyImages}
        fields={fields}
        showPublisherBranding={showPublisherBranding}
        showPublisherEmail={showPublisherEmail}
        showPublisherPhone={showPublisherPhone}
        agencyLogo={agencyLogo}
        Footer={footerComponent}
      />

      <TableOfContentsPage
        property={property}
        orientation={orientation}
        Footer={footerComponent}
        hasGallery={galleryPages.length > 0}
      />

      <PropertyDetailsPage
        property={property}
        propertyPrice={propertyPrice}
        propertyAddress={propertyAddress}
        orientation={orientation}
        propertyImages={propertyImages}
        fields={fields}
        showPublisherBranding={showPublisherBranding}
        agencyLogo={agencyLogo}
        Footer={footerComponent}
        propertyFeatures={propertyFeatures}
      />

      {galleryPages.map(({ imagesSubset, pageIndex }) => (
        <GalleryPage
          key={pageIndex}
          orientation={orientation}
          imagesSubset={imagesSubset}
          pageIndex={pageIndex}
          property={property}
          Footer={footerComponent}
        />
      ))}
    </>
  );
};
