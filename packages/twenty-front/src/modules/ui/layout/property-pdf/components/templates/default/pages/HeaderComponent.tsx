import { Col, Row } from '@/ui/layout/property-pdf/components/snippets/layout';
import { PDF_STYLES } from '@/ui/layout/property-pdf/components/templates/default/styles';
import { DefaultDocumentationTemplateProps } from '@/ui/layout/property-pdf/types/types';
import { Image, View } from '@react-pdf/renderer';

export type HeaderProps = Partial<DefaultDocumentationTemplateProps>;

export const Header = ({ agencyLogo }: HeaderProps) => {
  return (
    // fixed will repeat the header on each page if the page wraps
    <View style={PDF_STYLES.header} fixed>
      <Row>
        {agencyLogo && (
          <Col>
            <View
              style={{
                height: '100%',
                aspectRatio: 1,
              }}
            >
              <Image
                src={agencyLogo}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </View>
          </Col>
        )}
      </Row>
    </View>
  );
};
