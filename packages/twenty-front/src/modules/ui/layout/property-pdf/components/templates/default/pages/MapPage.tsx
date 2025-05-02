import {
  Col,
  Row,
  Section,
} from '@/ui/layout/property-pdf/components/snippets/layout';
import {
  H2,
  H3,
} from '@/ui/layout/property-pdf/components/snippets/typography';
import { PDF_STYLES } from '@/ui/layout/property-pdf/components/templates/default/styles';
import { PROPERTY_DETAILS_STYLES } from '@/ui/layout/property-pdf/components/templates/default/pages/property-details-styles';
import { DefaultDocumentationTemplateProps } from '@/ui/layout/property-pdf/types/types';
import { Page, Text, View, Image } from '@react-pdf/renderer';
import { useMemo } from 'react';

export type MapPageProps = Pick<
  DefaultDocumentationTemplateProps,
  | 'property'
  | 'orientation'
  | 'propertyAddress'
  | 'Footer'
  | 'addressMapUrl'
  | 'Header'
  | 'localizedStaticTexts'
>;

export const MapPage = ({
  property,
  orientation,
  propertyAddress,
  Footer,
  addressMapUrl,
  Header,
  localizedStaticTexts,
}: MapPageProps) => {
  // Format the property address for display
  const formattedAddress = useMemo(() => {
    if (!property.address) return propertyAddress;

    const {
      addressStreet1,
      addressStreet2,
      addressCity,
      addressPostcode,
      addressCountry,
    } = property.address;

    const parts = [
      addressStreet1 || '',
      addressStreet2 || '',
      [addressPostcode || '', addressCity || ''].filter(Boolean).join(' '),
      addressCountry || '',
    ].filter(Boolean);

    return parts.join(', ');
  }, [property.address, propertyAddress]);

  return (
    <Page
      style={PDF_STYLES.page}
      orientation={orientation}
      bookmark="Standort"
      id="location"
    >
      {Header && Header}
      <Section height="85%">
        <Row>
          <Col width="100%">
            <H2 style={{ marginBottom: 12 }}>
              {localizedStaticTexts?.locationTitle || 'Standort & Umgebung'}
            </H2>

            <View style={PROPERTY_DETAILS_STYLES.mapPageContainer}>
              <Text style={PROPERTY_DETAILS_STYLES.mapPageAddress}>
                {formattedAddress}
              </Text>

              {/* Map Image */}
              {addressMapUrl && (
                <View style={PROPERTY_DETAILS_STYLES.mapImageWrapper}>
                  <Image
                    src={addressMapUrl}
                    style={PROPERTY_DETAILS_STYLES.mapFullWidthImage}
                  />
                </View>
              )}

              {/* Location Description */}
              {property.address?.locationDescription && (
                <View style={PROPERTY_DETAILS_STYLES.locationInfoSection}>
                  <H3 style={PROPERTY_DETAILS_STYLES.sectionTitle}>
                    Lage & Umgebung
                  </H3>
                  <Text style={PROPERTY_DETAILS_STYLES.locationDescription}>
                    {property.address.locationDescription}
                  </Text>
                </View>
              )}

              {/* Public Transportation Info */}
              {property.address?.publicTransportation && (
                <View style={PROPERTY_DETAILS_STYLES.locationInfoSection}>
                  <H3 style={PROPERTY_DETAILS_STYLES.sectionTitle}>
                    Öffentlicher Verkehr
                  </H3>
                  <Text style={PROPERTY_DETAILS_STYLES.transportationInfo}>
                    {property.address.publicTransportation}
                  </Text>
                </View>
              )}
            </View>
          </Col>
        </Row>
      </Section>

      {/* Footer Section */}
      {Footer && Footer}
    </Page>
  );
};
