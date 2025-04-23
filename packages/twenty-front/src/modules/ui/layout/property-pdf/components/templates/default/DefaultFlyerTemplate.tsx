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

export type DefaultFlyerTemplateProps = PropertyPdfProps;

export const DefaultFlyerTemplate = ({
  property,
  propertyPrice,
  propertyAddress,
  propertyImages,
  agencyLogo,
  orientation,
  fields,
  propertyFeatures,
}: DefaultFlyerTemplateProps) => {
  const firstImage = useMemo(() => {
    if (!propertyImages || propertyImages.length === 0) return null;
    return propertyImages[0];
  }, [propertyImages]);

  const additionalImages = useMemo(() => {
    if (!propertyImages || propertyImages.length === 0) return [];
    return propertyImages.slice(1, 5);
  }, [propertyImages]);

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

  return (
    <Page style={PDF_STYLES.flyerPage} orientation={orientation}>
      <Section height="14%">
        <Row>
          <Col width="90%" gap={0.5}>
            <H1>{property.name}</H1>
            <H2>{propertyPrice}</H2>
            <H3>{propertyAddress}</H3>
          </Col>
          {agencyLogo && (
            <Col width="10%">
              <View style={PDF_STYLES.agencyLogoContainer}>
                <Image
                  src={'/logos/nestermind-logo.png'}
                  style={PDF_STYLES.agencyLogo}
                />
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

      <Section height="30%">
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

      <Section height={FOOTER_HEIGHT} style={PDF_STYLES.flyerFooter}>
        <Row gap={2}>
          <Col width="33%">
            <Row style={{ alignItems: 'center' }}>
              <View style={{ aspectRatio: 1, height: '100%' }}>
                <Image
                  src={'/logos/nestermind-logo.png'}
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
          <Col width="33%" style={{ justifyContent: 'center' }}>
            {property?.agency?.phone?.primaryPhone && (
              <H2 align="center">{property?.agency?.phone?.primaryPhone}</H2>
            )}
          </Col>
          <Col width="33%" style={{ justifyContent: 'center' }}>
            {property?.agency?.email?.primaryEmail && (
              <Body align="right">{property?.agency?.email?.primaryEmail}</Body>
            )}
          </Col>
        </Row>
      </Section>
    </Page>
  );
};
