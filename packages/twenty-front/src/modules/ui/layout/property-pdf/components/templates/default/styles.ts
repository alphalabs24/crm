import { DEFAULT_THEME } from '@/ui/layout/property-pdf/constants/defaultTheme';
import { FOOTER_HEIGHT } from '@/ui/layout/property-pdf/constants/footer';
import { HEADER_HEIGHT } from '@/ui/layout/property-pdf/constants/header';
import { StyleSheet } from '@react-pdf/renderer';

// Create styles with improved DEFAULT_THEME system
export const PDF_STYLES = StyleSheet.create({
  // Document & Page DEFAULT_THEME
  page: {
    fontFamily: DEFAULT_THEME.fonts.primary,
    color: DEFAULT_THEME.colors.text.primary,
    fontSize: DEFAULT_THEME.fonts.sizes.sm,
    backgroundColor: DEFAULT_THEME.colors.background.main,
    display: 'flex',
    flexDirection: 'column',
    gap: DEFAULT_THEME.spacing.md,
  },

  // Full-width page with no padding (for flyers)
  flyerPage: {
    fontFamily: DEFAULT_THEME.fonts.primary,
    color: DEFAULT_THEME.colors.text.primary,
    fontSize: DEFAULT_THEME.fonts.sizes.sm,
    backgroundColor: DEFAULT_THEME.colors.background.main,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },

  // Typography System
  heading1: {
    fontFamily: DEFAULT_THEME.fonts.primary,
    fontSize: DEFAULT_THEME.fonts.sizes.xxl,
    fontWeight: DEFAULT_THEME.fonts.weights.bold,
    color: DEFAULT_THEME.colors.textDark,
  },

  heading2: {
    fontFamily: DEFAULT_THEME.fonts.primary,
    fontSize: DEFAULT_THEME.fonts.sizes.xl,
    fontWeight: DEFAULT_THEME.fonts.weights.bold,
    color: DEFAULT_THEME.colors.textDark,
  },

  heading3: {
    fontFamily: DEFAULT_THEME.fonts.primary,
    fontSize: DEFAULT_THEME.fonts.sizes.lg,
    color: DEFAULT_THEME.colors.textDark,
  },

  bodyText: {
    fontFamily: DEFAULT_THEME.fonts.primary,
    fontSize: DEFAULT_THEME.fonts.sizes.sm,
    lineHeight: 1.2,
    color: DEFAULT_THEME.colors.textLight,
    textAlign: 'justify',
    textOverflow: 'ellipsis',
  },

  heading1White: {
    fontFamily: DEFAULT_THEME.fonts.primary,
    color: DEFAULT_THEME.colors.white,
    fontSize: DEFAULT_THEME.fonts.sizes.xxl,
    fontWeight: DEFAULT_THEME.fonts.weights.bold,
  },

  heading2White: {
    fontFamily: DEFAULT_THEME.fonts.primary,
    color: DEFAULT_THEME.colors.white,
    fontSize: DEFAULT_THEME.fonts.sizes.xl,
    fontWeight: DEFAULT_THEME.fonts.weights.semibold,
  },

  heading3White: {
    fontFamily: DEFAULT_THEME.fonts.primary,
    color: DEFAULT_THEME.colors.white,
    fontSize: DEFAULT_THEME.fonts.sizes.lg,
  },

  // Flex Containers
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
  },

  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
  },

  spacer: {
    height: DEFAULT_THEME.spacing.sm,
  },

  spacerHorizontal: {
    paddingHorizontal: DEFAULT_THEME.spacing.xs,
  },

  // Grid System
  grid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DEFAULT_THEME.spacing.sm,
    width: '100%',
  },

  gridItem: {
    flexBasis: `calc(50% - ${DEFAULT_THEME.spacing.sm}px)`,
    flexGrow: 0,
    flexShrink: 0,
  },

  // Section DEFAULT_THEMEs
  section: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    gap: DEFAULT_THEME.spacing.sm,
    paddingHorizontal: DEFAULT_THEME.spacing.md,
    paddingVertical: DEFAULT_THEME.spacing.md,
  },

  sectionFiller: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },

  // Hero Section
  heroSection: {
    position: 'relative',
    width: '100%',
    height: '30%',
  },

  flyerHeroSection: {
    position: 'relative',
    width: '100%',
    height: '25%',
    display: 'flex',
    flexDirection: 'column',
  },

  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    padding: DEFAULT_THEME.spacing.sm,
    backgroundColor: DEFAULT_THEME.colors.overlayBackground,
    backdropFilter: 'blur(8px)',
    display: 'flex',
    flexDirection: 'column',
    gap: DEFAULT_THEME.spacing.xxs,
  },

  // Feature Tags
  tagContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DEFAULT_THEME.spacing.xxs,
  },

  tag: {
    fontSize: DEFAULT_THEME.fonts.sizes.xs,
    padding: `${DEFAULT_THEME.spacing.xxs}px ${DEFAULT_THEME.spacing.xs}px`,
    backgroundColor: DEFAULT_THEME.colors.background.light,
    borderRadius: DEFAULT_THEME.borders.radius.sm,
    color: DEFAULT_THEME.colors.text.secondary,
  },

  // Gallery
  gallery: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    flexWrap: 'wrap',
    gap: DEFAULT_THEME.spacing.xs,
  },

  galleryItem: {
    flexBasis: `calc(25% - ${(DEFAULT_THEME.spacing.xs * 3) / 4}px)`,
    aspectRatio: 4 / 3,
  },

  galleryImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  // Documentation image gallery - 2x3 grid (6 images per page)
  imageGalleryGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DEFAULT_THEME.spacing.sm,
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },

  imageGalleryItem: {
    width: `49%`,
    height: '30%',
    marginBottom: DEFAULT_THEME.spacing.md,
  },

  imageGalleryImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  imageGalleryCaption: {
    fontSize: DEFAULT_THEME.fonts.sizes.xs,
    color: DEFAULT_THEME.colors.text.secondary,
    marginTop: DEFAULT_THEME.spacing.xxs,
    textAlign: 'center',
  },

  galleryPageTitle: {
    borderBottom: `1px solid ${DEFAULT_THEME.colors.divider}`,
    paddingBottom: DEFAULT_THEME.spacing.sm,
    marginBottom: DEFAULT_THEME.spacing.md,
  },

  // Flyer-specific gallery
  flyerGallery: {
    display: 'flex',
    flexDirection: 'row',
    height: '100%',
    gap: DEFAULT_THEME.spacing.xs * 2,
    width: '100%',
  },

  flyerGalleryItem: {
    height: '100%',
    width: `calc(33% - ${DEFAULT_THEME.spacing.xs}px)`,
    marginBottom: DEFAULT_THEME.spacing.xs,
  },

  // Footer
  footer: {
    borderTop: `0.5pt solid ${DEFAULT_THEME.colors.divider}`,
    paddingHorizontal: DEFAULT_THEME.spacing.md,
    paddingTop: DEFAULT_THEME.spacing.md,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: DEFAULT_THEME.spacing.xxs,
    height: FOOTER_HEIGHT,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  flyerFooter: {
    borderTop: `0.5pt solid ${DEFAULT_THEME.colors.divider}`,
    paddingHorizontal: DEFAULT_THEME.spacing.md,
    paddingTop: DEFAULT_THEME.spacing.md,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: DEFAULT_THEME.spacing.xxs,
    height: FOOTER_HEIGHT,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  PropertyLabel: {
    fontSize: DEFAULT_THEME.fonts.sizes.sm,
    fontWeight: DEFAULT_THEME.fonts.weights.semibold,
    color: DEFAULT_THEME.colors.textMedium,
    marginBottom: 2,
  },

  PropertyValue: {
    fontSize: DEFAULT_THEME.fonts.sizes.sm,
    color: DEFAULT_THEME.colors.textDark,
  },

  // Flyer Specific Styles
  flyerDEFAULT_THEME: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    height: '100%',
  },

  flyerContent: {
    display: 'flex',
    flexDirection: 'row',
    gap: DEFAULT_THEME.spacing.md,
    padding: DEFAULT_THEME.spacing.sm,
    flexGrow: 1,
    height: '65%',
  },

  flyerMainContent: {
    flex: 3,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },

  flyerSidebar: {
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: DEFAULT_THEME.spacing.xs,
    padding: DEFAULT_THEME.spacing.sm,
    backgroundColor: DEFAULT_THEME.colors.background.light,
    borderRadius: DEFAULT_THEME.borders.radius.md,
    maxWidth: '40%',
    justifyContent: 'space-between',
  },

  flyerImageContainer: {
    height: '60%',
    marginTop: DEFAULT_THEME.spacing.sm,
  },

  flyerContactInfo: {
    display: 'flex',
    flexDirection: 'row',
    gap: DEFAULT_THEME.spacing.md,
    padding: DEFAULT_THEME.spacing.xs,
    marginTop: 'auto',
    borderRadius: DEFAULT_THEME.borders.radius.sm,
    backgroundColor: DEFAULT_THEME.colors.background.light,
  },

  flyerContactColumn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: DEFAULT_THEME.spacing.xxs,
  },

  // Utility Classes
  textCenter: { textAlign: 'center' },
  textBold: { fontWeight: DEFAULT_THEME.fonts.weights.bold },
  mt: { marginTop: 'auto' },
  mb: { marginBottom: 'auto' },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  flexGrow: { flexGrow: 1 },
  contentPadding: { padding: DEFAULT_THEME.spacing.sm },

  // Agency Logo
  agencyLogoContainer: {
    alignItems: 'flex-end',
    padding: DEFAULT_THEME.spacing.xs,
    height: '100%',
    width: '100%',
  },

  agencyLogo: {
    maxWidth: 120,
    maxHeight: 60,
    objectFit: 'contain',
    objectPosition: 'right center',
  },

  // Header style
  header: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: DEFAULT_THEME.spacing.xxs,
    height: HEADER_HEIGHT,
    paddingVertical: DEFAULT_THEME.spacing.sm,
    paddingHorizontal: DEFAULT_THEME.spacing.md,
  },

  // Table of Contents styles
  tocContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: DEFAULT_THEME.spacing.sm,
    marginTop: DEFAULT_THEME.spacing.lg,
  },

  tocItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: DEFAULT_THEME.spacing.xs,
    borderBottom: `0.5pt dotted ${DEFAULT_THEME.colors.divider}`,
  },

  tocItemNumber: {
    fontSize: DEFAULT_THEME.fonts.sizes.md,
    fontWeight: DEFAULT_THEME.fonts.weights.semibold,
    width: '30px',
    color: DEFAULT_THEME.colors.primary,
  },

  tocItemText: {
    fontSize: DEFAULT_THEME.fonts.sizes.lg,
    color: DEFAULT_THEME.colors.textDark,
    flex: 1,
  },

  tocItemPage: {
    fontSize: DEFAULT_THEME.fonts.sizes.md,
    fontWeight: DEFAULT_THEME.fonts.weights.normal,
    width: '30px',
    textAlign: 'right',
    color: DEFAULT_THEME.colors.textMedium,
  },

  tocLink: {
    textDecoration: 'none',
  },
});
