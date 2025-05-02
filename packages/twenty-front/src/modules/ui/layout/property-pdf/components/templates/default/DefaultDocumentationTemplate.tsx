import { DefaultDocumentationTemplateProps } from '@/ui/layout/property-pdf/types/types';
import { useMemo } from 'react';

// Import page components from the pages directory
import { FirstPage } from './pages/FirstPage';
import { Footer } from './pages/FooterComponent';
import { Header } from './pages/HeaderComponent';
import { GalleryPage } from './pages/GalleryPage';
import { PropertyDetailsPage } from './pages/PropertyDetailsPage';
import { PropertyDescriptionPage } from './pages/PropertyDescriptionPage';
import { TableOfContentsPage } from './pages/TableOfContentsPage';
import { MapPage } from './pages/MapPage';

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
  configuration,
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

  // Check if there's a description to show
  const hasDescription =
    !!property.descriptionv2 &&
    property.descriptionv2.blocknote &&
    configuration?.showDescription;

  // Create footer component for reuse
  const footerComponent = (
    <Footer
      property={property}
      configuration={configuration}
      agencyLogo={agencyLogo}
    />
  );

  // Create header component for reuse
  const headerComponent = configuration?.showPublisherBranding ? (
    <Header agencyLogo={agencyLogo} />
  ) : null;

  return (
    <>
      <FirstPage
        property={property}
        propertyPrice={propertyPrice}
        propertyAddress={propertyAddress}
        orientation={orientation}
        propertyImages={propertyImages}
        fields={fields}
        configuration={configuration}
        agencyLogo={agencyLogo}
        Footer={footerComponent}
      />

      <TableOfContentsPage
        property={property}
        orientation={orientation}
        Footer={footerComponent}
        hasGallery={galleryPages.length > 0}
        hasDescription={hasDescription}
        configuration={configuration}
        Header={headerComponent}
      />

      {/* Add the description page if a description exists */}
      {hasDescription && (
        <PropertyDescriptionPage
          property={property}
          orientation={orientation}
          configuration={configuration}
          propertyPrice={propertyPrice}
          propertyAddress={propertyAddress}
          propertyImages={propertyImages}
          fields={fields}
          propertyFeatures={propertyFeatures}
          agencyLogo={agencyLogo}
          Footer={footerComponent}
          Header={headerComponent}
        />
      )}

      {/* Display Map Page if enabled */}
      {configuration?.showAddressMap && configuration?.addressMapUrl && (
        <MapPage
          property={property}
          propertyAddress={propertyAddress}
          orientation={orientation}
          addressMapUrl={configuration.addressMapUrl}
          Footer={footerComponent}
          Header={headerComponent}
        />
      )}

      <PropertyDetailsPage
        property={property}
        propertyPrice={propertyPrice}
        propertyAddress={propertyAddress}
        orientation={orientation}
        propertyImages={propertyImages}
        fields={fields}
        configuration={configuration}
        agencyLogo={agencyLogo}
        propertyFeatures={propertyFeatures}
        Footer={footerComponent}
        Header={headerComponent}
      />

      {configuration?.showAllImages &&
        galleryPages.map(({ imagesSubset, pageIndex }) => (
          <GalleryPage
            key={pageIndex}
            orientation={orientation}
            imagesSubset={imagesSubset}
            pageIndex={pageIndex}
            Footer={footerComponent}
          />
        ))}
    </>
  );
};
