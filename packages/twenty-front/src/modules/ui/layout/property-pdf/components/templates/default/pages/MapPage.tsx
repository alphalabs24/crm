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
import { DefaultDocumentationTemplateProps } from '@/ui/layout/property-pdf/types/types';
import { Page, Text, View, Image } from '@react-pdf/renderer';
import { useMemo } from 'react';

export type MapPageProps = Pick<
  DefaultDocumentationTemplateProps,
  'property' | 'orientation' | 'propertyAddress' | 'Footer' | 'addressMapUrl'
>;

export const MapPage = ({
  property,
  orientation,
  propertyAddress,
  Footer,
  addressMapUrl,
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
      <Section height="85%">
        <Row>
          <Col width="100%">
            <H2 style={{ marginBottom: 12 }}>Standort & Umgebung</H2>
            <Text style={{ marginBottom: 16 }}>{formattedAddress}</Text>

            {addressMapUrl && (
              <View
                style={{
                  marginTop: 20,
                  marginBottom: 20,
                  border: '1pt solid #E5E5E5',
                  borderRadius: 4,
                  padding: 2,
                  overflow: 'hidden',
                }}
              >
                <Image
                  src={addressMapUrl}
                  style={{
                    width: '100%',
                    height: 400,
                    objectFit: 'cover',
                    borderRadius: 2,
                  }}
                />
              </View>
            )}

            {/* Additional location information if available */}
            {property.address?.locationDescription && (
              <View style={{ marginTop: 20 }}>
                <H3 style={{ marginBottom: 8 }}>Lage</H3>
                <Text style={{ lineHeight: 1.5 }}>
                  {property.address.locationDescription}
                </Text>
              </View>
            )}

            {/* Coordinates if available */}
            {property.address?.addressLat && property.address?.addressLng && (
              <View style={{ marginTop: 20 }}>
                <H3 style={{ marginBottom: 8 }}>Koordinaten</H3>
                <Text>Breitengrad: {property.address.addressLat}</Text>
                <Text>Längengrad: {property.address.addressLng}</Text>
              </View>
            )}

            {/* Public transportation info if available */}
            {property.address?.publicTransportation && (
              <View style={{ marginTop: 20 }}>
                <H3 style={{ marginBottom: 8 }}>Öffentlicher Verkehr</H3>
                <Text style={{ lineHeight: 1.5 }}>
                  {property.address.publicTransportation}
                </Text>
              </View>
            )}
          </Col>
        </Row>
      </Section>

      {/* Footer Section */}
      {Footer && Footer}
    </Page>
  );
};
