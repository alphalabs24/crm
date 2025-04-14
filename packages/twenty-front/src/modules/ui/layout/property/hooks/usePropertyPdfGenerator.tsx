/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { usePropertyImages } from '@/ui/layout/show-page/hooks/usePropertyImages';
import * as ReactPDF from '@react-pdf/renderer';
import {
  Document,
  Font,
  Image,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { useCallback, useState } from 'react';
import { formatCurrency } from '~/utils/format';

// Import and register fonts
Font.register({
  family: 'Montserrat',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/montserrat/v15/JTUSjIg1_i6t8kCHKm459Wlhzg.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/montserrat/v15/JTURjIg1_i6t8kCHKm45_bZF3gnD-w.ttf',
      fontWeight: 600,
    },
    {
      src: 'https://fonts.gstatic.com/s/montserrat/v15/JTURjIg1_i6t8kCHKm45_dJE3gnD-w.ttf',
      fontWeight: 700,
    },
  ],
});

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff', // Using white for PDF background
    fontFamily: 'Montserrat',
  },
  section: {
    marginBottom: 10,
  },
  heroSection: {
    height: '50%',
    marginBottom: 20,
    position: 'relative',
  },
  // Flyer-specific smaller hero section to fit more content
  flyerHeroSection: {
    height: '35%',
    marginBottom: 10,
    position: 'relative',
  },
  coverImageContainer: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 5,
  },
  coverImage: {
    objectFit: 'cover',
    width: '100%',
    height: '100%',
  },
  overlayBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
    padding: 15,
  },
  propertyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  propertyAddress: {
    fontSize: 12,
    color: 'white',
  },
  propertyPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  header: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#333333', // Dark text for headers
    borderBottom: '1px solid #eeeeee',
    paddingBottom: 5,
  },
  flyerHeader: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#333333',
    paddingBottom: 2,
  },
  subheader: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'semibold',
    color: '#444444', // Slightly lighter than headers
  },
  flyerSubheader: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: 'semibold',
    color: '#444444',
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
    lineHeight: 1.5,
    color: '#555555', // Standard text color
  },
  flyerText: {
    fontSize: 10,
    marginBottom: 4,
    lineHeight: 1.4,
    color: '#555555',
  },
  flyerDescription: {
    fontSize: 9,
    lineHeight: 1.2,
    color: '#555555',
    marginBottom: 8,
  },
  boldText: {
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  flyerRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  column: {
    flex: 1,
  },
  infoBox: {
    backgroundColor: '#f9f9f9', // Light background for info boxes
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  flyerInfoBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
  },
  keyFeature: {
    fontSize: 11,
    marginBottom: 5,
    backgroundColor: '#edf2f7', // Light blue background for feature tags
    color: '#4a5568', // Dark blue text for feature tags
    padding: '3 7',
    borderRadius: 3,
    display: 'flex', // Using flex instead of inline-block for PDF
    marginRight: 5,
  },
  flyerKeyFeature: {
    fontSize: 9,
    marginBottom: 4,
    backgroundColor: '#edf2f7',
    color: '#4a5568',
    padding: '2 5',
    borderRadius: 3,
    display: 'flex',
    marginRight: 4,
    marginTop: 2,
  },
  keyFeatureContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  flyerKeyFeatureContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  flyerContentRow: {
    flexDirection: 'row',
    marginTop: 3,
    marginBottom: 5,
    gap: 10,
  },
  flyerLeftColumn: {
    flex: 3, // Increased flex ratio to give more space to left column
  },
  flyerRightColumn: {
    flex: 2, // Decreased right column size
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    padding: 8,
  },
  flyerDescriptionContainer: {
    maxHeight: 100, // Limit height of description container
    marginBottom: 12,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  thumbnail: {
    width: '31%',
    height: 100,
    margin: '0 1% 10px 1%',
    borderRadius: 3,
  },
  flyerThumbnail: {
    width: '31%',
    height: 70, // Reduced from 80px to 70px
    margin: '0 1% 5px 1%', // Reduced bottom margin from 6px to 5px
    borderRadius: 3,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 3,
  },
  footer: {
    marginTop: 20,
    borderTop: '1px solid #eeeeee',
    paddingTop: 10,
    fontSize: 10,
    color: '#888888', // Light gray for footer text
    textAlign: 'center',
  },
  flyerFooter: {
    marginTop: 5,
    borderTop: '1px solid #eeeeee',
    paddingTop: 5,
    fontSize: 7,
    color: '#888888',
    textAlign: 'center',
  },
  agencySection: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderTop: '1px solid #eeeeee',
    paddingTop: 15,
  },
  flyerAgencySection: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    borderTop: '1px solid #eeeeee',
    paddingTop: 5,
  },
  agencyInfo: {
    flex: 1,
  },
  agencyName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  flyerAgencyName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  contactInfo: {
    fontSize: 10,
    color: '#555555',
    marginBottom: 3,
  },
  flyerContactInfo: {
    fontSize: 8,
    color: '#555555',
    marginBottom: 2,
  },
  logo: {
    width: 100,
    height: 50,
    marginLeft: 10,
    objectFit: 'contain',
  },
});

// Format feature names in a more readable way
const formatFeatureName = (feature: string) => {
  return feature
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

// Truncate text to a maximum number of characters
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export type PropertyPdfType = 'PropertyDocumentation' | 'PropertyFlyer';

export type PropertyPdfResult = {
  blob: Blob;
  fileName: string;
  previewUrl: string;
};

export const usePropertyPdfGenerator = ({
  // used for preloading the images.
  record,
}: {
  record: ObjectRecord | null;
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPropertyId, setCurrentPropertyId] = useState<string>(
    record?.id || '',
  );

  // Get property images when property ID changes
  const propertyImages = usePropertyImages({
    id: currentPropertyId,
    targetObjectNameSingular: CoreObjectNameSingular.Property,
  });

  const generatePropertyPdf = useCallback(
    async (
      property: ObjectRecord,
      type: PropertyPdfType = 'PropertyDocumentation',
      orientation: 'portrait' | 'landscape' = 'portrait',
    ): Promise<PropertyPdfResult> => {
      setLoading(true);
      setError(null);

      try {
        // Set current property ID to fetch images
        setCurrentPropertyId(property.id);

        // Construct file name
        const fileName = `${property.name ? property.name : 'Property'}_${
          type === 'PropertyFlyer' ? 'Flyer' : 'Documentation'
        }`;

        // Get formatted address
        const address = property.address;
        const formattedAddress = address
          ? [
              address.addressStreet1,
              address.addressStreet2,
              `${address.addressPostcode} ${address.addressCity}`,
              address.addressState,
              address.addressCountry,
            ]
              .filter(Boolean)
              .join(', ')
          : '';

        // Format price if available
        const price = property.sellingPrice?.amountMicros
          ? formatCurrency(
              property.sellingPrice.amountMicros / 1000000,
              property.sellingPrice.currencyCode || 'CHF',
            )
          : property.rentNet?.amountMicros
            ? `${formatCurrency(
                property.rentNet.amountMicros / 1000000,
                property.rentNet.currencyCode || 'CHF',
              )} / month`
            : 'Price on request';

        // Create PDF component based on type
        const PropertyDocument = () => (
          <Document>
            {/* Cover page */}
            <Page size="A4" orientation={orientation} style={styles.page}>
              {type === 'PropertyFlyer' ? (
                // Flyer layout - optimized for single page
                <>
                  <View style={styles.flyerHeroSection}>
                    <View style={styles.coverImageContainer}>
                      {propertyImages && propertyImages.length > 0 ? (
                        <Image
                          src={propertyImages[0].fullPath}
                          style={styles.coverImage}
                        />
                      ) : (
                        <View
                          style={{
                            ...styles.coverImage,
                            backgroundColor: '#edf2f7',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <Text>No Image Available</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.overlayBanner}>
                      <Text style={styles.propertyTitle}>{property.name}</Text>
                      <Text style={styles.propertyAddress}>
                        {formattedAddress}
                      </Text>
                      <Text style={styles.propertyPrice}>{price}</Text>
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.flyerHeader}>Property Overview</Text>

                    <View style={styles.flyerContentRow}>
                      {/* Left column with images */}
                      <View style={styles.flyerLeftColumn}>
                        {propertyImages && propertyImages.length > 1 && (
                          <View style={styles.imagesGrid}>
                            {propertyImages.slice(1, 6).map((image, index) => (
                              <View key={index} style={styles.flyerThumbnail}>
                                <Image
                                  src={image.fullPath}
                                  style={styles.thumbnailImage}
                                />
                              </View>
                            ))}
                          </View>
                        )}
                      </View>

                      {/* Right column with key details */}
                      <View style={styles.flyerRightColumn}>
                        <Text style={styles.flyerSubheader}>Key Details</Text>
                        <Text style={styles.flyerText}>
                          <Text style={styles.boldText}>Type: </Text>
                          {property.category || 'N/A'}
                        </Text>
                        <Text style={styles.flyerText}>
                          <Text style={styles.boldText}>Rooms: </Text>
                          {property.rooms || 'N/A'}
                        </Text>
                        <Text style={styles.flyerText}>
                          <Text style={styles.boldText}>Living Area: </Text>
                          {property.livingSurface
                            ? `${property.livingSurface} m²`
                            : 'N/A'}
                        </Text>
                        <Text style={styles.flyerText}>
                          <Text style={styles.boldText}>Total Area: </Text>
                          {property.surface ? `${property.surface} m²` : 'N/A'}
                        </Text>
                        <Text style={styles.flyerText}>
                          <Text style={styles.boldText}>Built: </Text>
                          {property.constructionYear || 'N/A'}
                        </Text>
                        <Text style={styles.flyerText}>
                          <Text style={styles.boldText}>Available: </Text>
                          {property.availableFrom
                            ? new Date(
                                property.availableFrom,
                              ).toLocaleDateString()
                            : 'Immediately'}
                        </Text>

                        {property.features && property.features.length > 0 && (
                          <>
                            <Text
                              style={{ ...styles.flyerSubheader, marginTop: 5 }}
                            >
                              Features
                            </Text>
                            <View style={styles.flyerKeyFeatureContainer}>
                              {property.features
                                .slice(0, 8)
                                .map((feature: string, index: number) => (
                                  <Text
                                    key={index}
                                    style={styles.flyerKeyFeature}
                                  >
                                    {formatFeatureName(feature)}
                                  </Text>
                                ))}
                            </View>
                          </>
                        )}
                      </View>
                    </View>

                    {/* Agency information */}
                    <View style={styles.flyerAgencySection}>
                      <View style={styles.agencyInfo}>
                        <Text style={styles.flyerAgencyName}>
                          {property.agency?.name || 'Contact Us'}
                        </Text>
                        {property.agency?.email?.primaryEmail && (
                          <Text style={styles.flyerContactInfo}>
                            Email: {property.agency.email.primaryEmail}
                          </Text>
                        )}
                        {property.agency?.phone?.primaryPhoneNumber && (
                          <Text style={styles.flyerContactInfo}>
                            Phone:{' '}
                            {property.agency.phone.primaryPhoneCallingCode}{' '}
                            {property.agency.phone.primaryPhoneNumber}
                          </Text>
                        )}
                        {property.assignee?.name && (
                          <Text style={styles.flyerContactInfo}>
                            Contact: {property.assignee.name.firstName}{' '}
                            {property.assignee.name.lastName}
                          </Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.flyerFooter}>
                      <Text>
                        Generated on {new Date().toLocaleDateString()} |
                        {property.agency?.name
                          ? ` ${property.agency.name} `
                          : ' '}
                        All rights reserved.
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                // Documentation layout - More detailed across multiple pages
                <>
                  <View style={styles.heroSection}>
                    <View style={styles.coverImageContainer}>
                      {propertyImages && propertyImages.length > 0 ? (
                        <Image
                          src={propertyImages[0].fullPath}
                          style={styles.coverImage}
                        />
                      ) : (
                        <View
                          style={{
                            ...styles.coverImage,
                            backgroundColor: '#edf2f7',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <Text>No Image Available</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.overlayBanner}>
                      <Text style={styles.propertyTitle}>{property.name}</Text>
                      <Text style={styles.propertyAddress}>
                        {formattedAddress}
                      </Text>
                      <Text style={styles.propertyPrice}>{price}</Text>
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.header}>Property Overview</Text>
                    <View style={styles.row}>
                      <View style={styles.column}>
                        <Text style={styles.text}>
                          <Text style={styles.boldText}>Type: </Text>
                          {property.category || 'N/A'}
                        </Text>
                        <Text style={styles.text}>
                          <Text style={styles.boldText}>Rooms: </Text>
                          {property.rooms || 'N/A'}
                        </Text>
                        <Text style={styles.text}>
                          <Text style={styles.boldText}>Living Area: </Text>
                          {property.livingSurface
                            ? `${property.livingSurface} m²`
                            : 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.column}>
                        <Text style={styles.text}>
                          <Text style={styles.boldText}>Year Built: </Text>
                          {property.constructionYear || 'N/A'}
                        </Text>
                        <Text style={styles.text}>
                          <Text style={styles.boldText}>Available From: </Text>
                          {property.availableFrom
                            ? new Date(
                                property.availableFrom,
                              ).toLocaleDateString()
                            : 'Immediately'}
                        </Text>
                        <Text style={styles.text}>
                          <Text style={styles.boldText}>Total Area: </Text>
                          {property.surface ? `${property.surface} m²` : 'N/A'}
                        </Text>
                      </View>
                    </View>

                    {property.features && property.features.length > 0 && (
                      <View style={styles.section}>
                        <Text style={styles.subheader}>Key Features</Text>
                        <View style={styles.keyFeatureContainer}>
                          {property.features.map(
                            (feature: string, index: number) => (
                              <Text key={index} style={styles.keyFeature}>
                                {formatFeatureName(feature)}
                              </Text>
                            ),
                          )}
                        </View>
                      </View>
                    )}

                    {property.description && (
                      <View style={styles.section}>
                        <Text style={styles.subheader}>Description</Text>
                        <Text style={styles.text}>{property.description}</Text>
                      </View>
                    )}

                    {/* Only show if we're generating documentation (not flyer) */}
                    {propertyImages && propertyImages.length > 1 && (
                      <View style={styles.section}>
                        <Text style={styles.header}>Gallery</Text>
                        <View style={styles.imagesGrid}>
                          {propertyImages.slice(1, 7).map((image, index) => (
                            <View key={index} style={styles.thumbnail}>
                              <Image
                                src={image.fullPath}
                                style={styles.thumbnailImage}
                              />
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Agency information */}
                    <View style={styles.agencySection}>
                      <View style={styles.agencyInfo}>
                        <Text style={styles.agencyName}>
                          {property.agency?.name || 'Contact Us'}
                        </Text>
                        {property.agency?.email?.primaryEmail && (
                          <Text style={styles.contactInfo}>
                            Email: {property.agency.email.primaryEmail}
                          </Text>
                        )}
                        {property.agency?.phone?.primaryPhoneNumber && (
                          <Text style={styles.contactInfo}>
                            Phone:{' '}
                            {property.agency.phone.primaryPhoneCallingCode}{' '}
                            {property.agency.phone.primaryPhoneNumber}
                          </Text>
                        )}
                        {property.assignee?.name && (
                          <Text style={styles.contactInfo}>
                            Contact: {property.assignee.name.firstName}{' '}
                            {property.assignee.name.lastName}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </>
              )}
            </Page>

            {/* Additional pages for documentation type only */}
            {type === 'PropertyDocumentation' && (
              <Page size="A4" orientation={orientation} style={styles.page}>
                <Text style={styles.header}>Property Details</Text>

                {/* Additional property details for documentation */}
                <View style={styles.infoBox}>
                  <View style={styles.row}>
                    <View style={styles.column}>
                      <Text style={styles.text}>
                        <Text style={styles.boldText}>Property Type: </Text>
                        {property.category || 'N/A'}
                      </Text>
                      <Text style={styles.text}>
                        <Text style={styles.boldText}>Sub-type: </Text>
                        {property.propertySubtype ||
                          property.apartmentSubtype ||
                          property.houseSubtype ||
                          'N/A'}
                      </Text>
                      <Text style={styles.text}>
                        <Text style={styles.boldText}>Offer Type: </Text>
                        {property.offerType || 'N/A'}
                      </Text>
                      <Text style={styles.text}>
                        <Text style={styles.boldText}>Reference: </Text>
                        {property.refProperty || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.column}>
                      <Text style={styles.text}>
                        <Text style={styles.boldText}>Rooms: </Text>
                        {property.rooms || 'N/A'}
                      </Text>
                      <Text style={styles.text}>
                        <Text style={styles.boldText}>Living Area: </Text>
                        {property.livingSurface
                          ? `${property.livingSurface} m²`
                          : 'N/A'}
                      </Text>
                      <Text style={styles.text}>
                        <Text style={styles.boldText}>Total Area: </Text>
                        {property.surface ? `${property.surface} m²` : 'N/A'}
                      </Text>
                      <Text style={styles.text}>
                        <Text style={styles.boldText}>Usable Area: </Text>
                        {property.usableSurface
                          ? `${property.usableSurface} m²`
                          : 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.subheader}>Building Information</Text>
                <View style={styles.infoBox}>
                  <View style={styles.row}>
                    <View style={styles.column}>
                      <Text style={styles.text}>
                        <Text style={styles.boldText}>Year Built: </Text>
                        {property.constructionYear || 'N/A'}
                      </Text>
                      <Text style={styles.text}>
                        <Text style={styles.boldText}>Last Renovated: </Text>
                        {property.renovationYear || 'N/A'}
                      </Text>
                      <Text style={styles.text}>
                        <Text style={styles.boldText}>Floors: </Text>
                        {property.numberOfFloors || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.column}>
                      <Text style={styles.text}>
                        <Text style={styles.boldText}>Ceiling Height: </Text>
                        {property.ceilingHeight
                          ? `${property.ceilingHeight} cm`
                          : 'N/A'}
                      </Text>
                      <Text style={styles.text}>
                        <Text style={styles.boldText}>Hall Height: </Text>
                        {property.hallHeight
                          ? `${property.hallHeight} m`
                          : 'N/A'}
                      </Text>
                      <Text style={styles.text}>
                        <Text style={styles.boldText}>Volume: </Text>
                        {property.volume ? `${property.volume} m³` : 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>

                {property.virtualTour &&
                  property.virtualTour.primaryLinkUrl && (
                    <View style={styles.section}>
                      <Text style={styles.subheader}>Virtual Tour</Text>
                      <Link src={property.virtualTour.primaryLinkUrl}>
                        <Text
                          style={{
                            ...styles.text,
                            color: 'blue',
                            textDecoration: 'underline',
                          }}
                        >
                          Click here to view the virtual tour
                        </Text>
                      </Link>
                    </View>
                  )}

                {/* Assign a QR code or something in the future */}
                <View style={styles.footer}>
                  <Text>
                    Generated on {new Date().toLocaleDateString()} |
                    {property.agency?.name ? ` ${property.agency.name} ` : ' '}
                    All rights reserved.
                  </Text>
                </View>
              </Page>
            )}
          </Document>
        );

        // Create PDF blob
        const blob = await ReactPDF.pdf(<PropertyDocument />).toBlob();
        const previewUrl = URL.createObjectURL(blob);

        setLoading(false);
        return {
          blob,
          fileName: `${fileName}.pdf`,
          previewUrl,
        };
      } catch (err: any) {
        setError(err);
        setLoading(false);
        throw err;
      }
    },
    [propertyImages],
  );

  const downloadPropertyPdf = useCallback(
    async (
      property: ObjectRecord,
      type: PropertyPdfType = 'PropertyDocumentation',
      orientation: 'portrait' | 'landscape' = 'portrait',
    ) => {
      try {
        const { blob, fileName } = await generatePropertyPdf(
          property,
          type,
          orientation,
        );
        saveAs(blob, fileName);
        return true;
      } catch (err) {
        return false;
      }
    },
    [generatePropertyPdf],
  );

  return {
    generatePropertyPdf,
    downloadPropertyPdf,
    loading,
    error,
  };
};
