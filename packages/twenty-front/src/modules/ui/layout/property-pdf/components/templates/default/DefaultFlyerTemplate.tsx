import {
  Col,
  Row,
  Section,
} from '@/ui/layout/property-pdf/components/snippets/layout';
import {
  Body,
  H1,
  H2,
  H3,
} from '@/ui/layout/property-pdf/components/snippets/typography';
import { PDF_STYLES } from '@/ui/layout/property-pdf/components/templates/default/styles';
import { FOOTER_HEIGHT } from '@/ui/layout/property-pdf/constants/footer';
import { PropertyPdfProps } from '@/ui/layout/property-pdf/types/types';
import { Image, Page, Text, View } from '@react-pdf/renderer';
import { useMemo } from 'react';

export type DefaultFlyerTemplateProps = PropertyPdfProps & {
  // Add publisher configuration options
  showPublisherBranding?: boolean;
  showPublisherEmail?: boolean;
  showPublisherPhone?: boolean;
};

export const DefaultFlyerTemplate = ({
  property,
  propertyPrice,
  propertyAddress,
  propertyImages,
  agencyLogo,
  orientation,
  fields,
  propertyFeatures,
  configuration,
}: DefaultFlyerTemplateProps) => {
  const firstImage = useMemo(() => {
    if (!propertyImages || propertyImages.length === 0) return null;
    return propertyImages[0];
  }, [propertyImages]);

  const additionalImages = useMemo(() => {
    if (!configuration?.showAllImages) return [];
    if (!propertyImages || propertyImages.length === 0) return [];
    return propertyImages.slice(1, 5);
  }, [configuration?.showAllImages, propertyImages]);

  const featuresForDisplay = useMemo(() => {
    if (!propertyFeatures || propertyFeatures.length === 0) return [];
    return propertyFeatures.slice(0, 6);
  }, [propertyFeatures]);

  const extraFeaturesCount = useMemo(() => {
    if (!propertyFeatures || propertyFeatures.length <= 6) return 0;
    return propertyFeatures.length - 6;
  }, [propertyFeatures]);

  const truncatedDescription = useMemo(() => {
    if (!property?.description) return '';

    if (property.description.length <= 750) {
      return property.description;
    }

    return property.description.substring(0, 750) + '...';
  }, [property?.description]);

  // Determine if we need to show the footer based on publisher settings
  const shouldShowFooter =
    configuration?.showPublisherBranding ||
    configuration?.showPublisherEmail ||
    configuration?.showPublisherPhone;

  // Adjust content height based on footer visibility
  const contentHeight = shouldShowFooter ? '30%' : '36%';

  return (
    <Page style={PDF_STYLES.flyerPage} orientation={orientation}>
      <Section height="14%">
        <Row>
          <Col width="90%" gap={0.5}>
            <H1>{property.name}</H1>
            <H2>{propertyPrice}</H2>
            <H3>{propertyAddress}</H3>
          </Col>
          {configuration?.showPublisherBranding && agencyLogo && (
            <Col width="10%">
              <View style={PDF_STYLES.agencyLogoContainer}>
                <Image src={agencyLogo} style={PDF_STYLES.agencyLogo} />
              </View>
            </Col>
          )}
        </Row>
      </Section>

      <Section height="50%">
        <Image src={firstImage?.fullPath} style={PDF_STYLES.heroImage} />
        <Row height="auto" style={PDF_STYLES.flyerGallery}>
          {additionalImages.map((image, index) => (
            <Col key={index} width="33%" style={PDF_STYLES.flyerGalleryItem}>
              <Image src={image?.fullPath} style={PDF_STYLES.galleryImage} />
            </Col>
          ))}
        </Row>
      </Section>

      <Section height={contentHeight}>
        <Row gap={4}>
          <Col width="66%">
            <H1 uppercase>Über das Objekt</H1>
            {property?.description && <Body>{truncatedDescription}</Body>}
            <View style={PDF_STYLES.tagContainer}>
              {featuresForDisplay.map((feature, index) => (
                <Text key={index} style={PDF_STYLES.tag}>
                  {feature.label}
                </Text>
              ))}
              {extraFeaturesCount > 0 && (
                <Text style={PDF_STYLES.tag}>+{extraFeaturesCount}</Text>
              )}
            </View>
          </Col>
          <Col width="33%">
            <H2 uppercase>Eigenschaften</H2>
            {fields.map(
              (field) =>
                field.label &&
                field.value && (
                  <View key={field.label}>
                    <Text style={PDF_STYLES.PropertyLabel}>{field.label}</Text>
                    <Text style={PDF_STYLES.PropertyValue}>{field.value}</Text>
                  </View>
                ),
            )}
          </Col>
        </Row>
      </Section>

      {shouldShowFooter && (
        <Section height={FOOTER_HEIGHT} style={PDF_STYLES.flyerFooter}>
          <Row gap={2}>
            {configuration?.showPublisherBranding && agencyLogo && (
              <Col width="33%">
                <Row style={{ alignItems: 'center' }}>
                  <View style={{ aspectRatio: 1, height: '100%' }}>
                    <Image
                      src={agencyLogo}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  </View>
                  <H3>{property?.agency?.name}</H3>
                </Row>
              </Col>
            )}

            <Col
              width={
                configuration?.showPublisherBranding &&
                configuration?.showPublisherEmail
                  ? '33%'
                  : configuration?.showPublisherBranding ||
                      configuration?.showPublisherEmail
                    ? '67%'
                    : '100%'
              }
              style={{ justifyContent: 'center' }}
            >
              {configuration?.showPublisherPhone &&
                property?.agency?.phone?.primaryPhone && (
                  <H2 align="center">
                    {property?.agency?.phone?.primaryPhone}
                  </H2>
                )}
            </Col>

            {configuration?.showPublisherEmail &&
              property?.agency?.email?.primaryEmail && (
                <Col
                  width={
                    configuration?.showPublisherBranding &&
                    configuration?.showPublisherPhone
                      ? '33%'
                      : configuration?.showPublisherBranding ||
                          configuration?.showPublisherPhone
                        ? '67%'
                        : '100%'
                  }
                  style={{ justifyContent: 'center' }}
                >
                  <Body align="right">
                    {property?.agency?.email?.primaryEmail}
                  </Body>
                </Col>
              )}
          </Row>
        </Section>
      )}
    </Page>
  );
};
