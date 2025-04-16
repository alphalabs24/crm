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
  orientation,
  fields,
}: DefaultFlyerTemplateProps) => {
  const firstImage = useMemo(() => {
    if (!propertyImages || propertyImages.length === 0) return null;
    return propertyImages[0];
  }, [propertyImages]);

  const additionalImages = useMemo(() => {
    if (!propertyImages || propertyImages.length === 0) return [];
    return propertyImages.slice(2, 5);
  }, [propertyImages]);

  return (
    <Page style={PDF_STYLES.flyerPage} orientation={orientation}>
      <Section height="10%">
        <Col gap={0.5}>
          <H1>{property.name}</H1>
          <H2>{propertyPrice}</H2>
          <H3>{propertyAddress}</H3>
        </Col>
      </Section>

      <Section height="55%">
        <Image src={firstImage?.fullPath} style={PDF_STYLES.heroImage} />
        <Row height="auto" style={PDF_STYLES.flyerGallery}>
          {additionalImages.map((image, index) => (
            <Col key={index} width="33%" style={PDF_STYLES.flyerGalleryItem}>
              <Image src={image?.fullPath} style={PDF_STYLES.galleryImage} />
            </Col>
          ))}
        </Row>
      </Section>

      <Section height="25%">
        <Row gap={4}>
          <Col width="66%">
            <H1 uppercase>About the Property</H1>
            {property?.description && <Body>{property?.description}</Body>}
          </Col>
          <Col width="33%">
            <H2 uppercase>Details</H2>
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
            <H2>{property?.agency?.name}</H2>
          </Col>
          <Col width="33%">
            {property?.agency?.phone?.primaryPhone && (
              <H2 align="center">{property?.agency?.phone?.primaryPhone}</H2>
            )}
          </Col>
          <Col width="33%">
            {property?.agency?.email?.primaryEmail && (
              <Body align="right">{property?.agency?.email?.primaryEmail}</Body>
            )}
          </Col>
        </Row>
      </Section>
    </Page>
  );
};
