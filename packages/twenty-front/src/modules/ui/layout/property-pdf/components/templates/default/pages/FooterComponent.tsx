import {
  Col,
  Row,
  Section,
} from '@/ui/layout/property-pdf/components/snippets/layout';
import {
  Body,
  H2,
  H3,
} from '@/ui/layout/property-pdf/components/snippets/typography';
import { PDF_STYLES } from '@/ui/layout/property-pdf/components/templates/default/styles';
import { FOOTER_HEIGHT } from '@/ui/layout/property-pdf/constants/footer';
import { DefaultDocumentationTemplateProps } from '@/ui/layout/property-pdf/types/types';
import { Image, View } from '@react-pdf/renderer';

export type FooterProps = Partial<DefaultDocumentationTemplateProps>;

export const Footer = ({
  property,
  configuration,
  agencyLogo,
}: FooterProps) => {
  return (
    // fixed will repeat the footer on each page if the page wraps
    <Section height={FOOTER_HEIGHT} style={PDF_STYLES.footer} fixed>
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
              ? '30%'
              : configuration?.showPublisherBranding ||
                  configuration?.showPublisherEmail
                ? '67%'
                : '100%'
          }
          style={{ justifyContent: 'center' }}
        >
          {configuration?.showPublisherPhone &&
            property?.agency?.phone?.primaryPhone && (
              <H2 align="center">{property?.agency?.phone?.primaryPhone}</H2>
            )}
        </Col>

        <Col
          style={{ justifyContent: 'center' }}
          width={
            configuration?.showPublisherBranding &&
            configuration?.showPublisherPhone
              ? '30%'
              : configuration?.showPublisherBranding ||
                  configuration?.showPublisherPhone
                ? '67%'
                : '100%'
          }
        >
          {configuration?.showPublisherEmail &&
            property?.agency?.email?.primaryEmail && (
              <Body align="right">{property?.agency?.email?.primaryEmail}</Body>
            )}
        </Col>

        <Col
          style={{ justifyContent: 'center' }}
          width="3%"
          render={(props) => <Body>{props.pageNumber}</Body>}
        />
      </Row>
    </Section>
  );
};
