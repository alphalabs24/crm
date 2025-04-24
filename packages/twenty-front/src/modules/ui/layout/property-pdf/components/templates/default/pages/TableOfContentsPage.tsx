import { Section } from '@/ui/layout/property-pdf/components/snippets/layout';
import { H1 } from '@/ui/layout/property-pdf/components/snippets/typography';
import { PDF_STYLES } from '@/ui/layout/property-pdf/components/templates/default/styles';
import { DefaultDocumentationTemplateProps } from '@/ui/layout/property-pdf/types/types';
import { Link, Page, Text, View } from '@react-pdf/renderer';

export type TableOfContentsPageProps =
  Partial<DefaultDocumentationTemplateProps> & {
    hasGallery: boolean;
    hasDescription?: boolean;
    showAddressMap?: boolean;
  };

export const TableOfContentsPage = ({
  orientation,
  Footer,
  hasGallery,
  hasDescription = false,
  showAddressMap = false,
}: TableOfContentsPageProps) => {
  // Calculate page numbers based on what content is available
  let currentPage = 3; // First page + TOC page + 1

  // Description comes first if it exists
  const descriptionPageNumber = hasDescription ? currentPage++ : 0;

  // Map comes second if enabled
  const mapPageNumber = showAddressMap ? currentPage++ : 0;

  // Property details always comes after description and map
  const detailsPageNumber = currentPage++;

  // Gallery comes last
  const galleryPageNumber = hasGallery ? currentPage : 0;

  return (
    <Page
      style={PDF_STYLES.page}
      orientation={orientation}
      bookmark="Inhaltsverzeichnis"
    >
      <Section height="75%">
        <H1 style={{ marginBottom: 10 }}>Inhaltsverzeichnis</H1>

        <View style={PDF_STYLES.tocContainer}>
          {/* Update the TOC links to reflect the new page order */}
          {hasDescription && (
            <Link src="#propertyDescription" style={PDF_STYLES.tocLink}>
              <View style={PDF_STYLES.tocItem}>
                <Text style={PDF_STYLES.tocItemText}>
                  Über die Liegenschaft
                </Text>
                <Text style={PDF_STYLES.tocItemPage}>
                  {descriptionPageNumber}
                </Text>
              </View>
            </Link>
          )}

          {showAddressMap && (
            <Link src="#location" style={PDF_STYLES.tocLink}>
              <View style={PDF_STYLES.tocItem}>
                <Text style={PDF_STYLES.tocItemText}>Standort & Umgebung</Text>
                <Text style={PDF_STYLES.tocItemPage}>{mapPageNumber}</Text>
              </View>
            </Link>
          )}

          <Link src="#propertyDetails" style={PDF_STYLES.tocLink}>
            <View style={PDF_STYLES.tocItem}>
              <Text style={PDF_STYLES.tocItemText}>Liegenschaftsdaten</Text>
              <Text style={PDF_STYLES.tocItemPage}>{detailsPageNumber}</Text>
            </View>
          </Link>

          {hasGallery && (
            <Link src="#gallery" style={PDF_STYLES.tocLink}>
              <View style={PDF_STYLES.tocItem}>
                <Text style={PDF_STYLES.tocItemText}>Bildergalerie</Text>
                <Text style={PDF_STYLES.tocItemPage}>{galleryPageNumber}</Text>
              </View>
            </Link>
          )}
        </View>
      </Section>

      {Footer && Footer}
    </Page>
  );
};
