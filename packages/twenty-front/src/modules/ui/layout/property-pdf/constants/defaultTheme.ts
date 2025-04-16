/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { Font } from '@react-pdf/renderer';

// Define the theme type
export type PdfTheme = {
  colors: {
    primary: string;
    secondary: string;
    text: {
      primary: string;
      secondary: string;
      light: string;
    };
    background: {
      main: string;
      light: string;
      dark: string;
    };
    border: string;
    imagePlaceholder: string;
    white: string;
    textDark: string;
    textMedium: string;
    textLight: string;
    textLighter: string;
    divider: string;
    link: string;
    overlayBackground: string;
  };
  fonts: {
    primary: string;
    fallback: string;
    sizes: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
      xxxl: number;
      title: number;
    };
    weights: {
      normal: number;
      semibold: number;
      bold: number;
    };
  };
  fontSizes: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  spacing: {
    unit: number;
    xxs: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borders: {
    radius: {
      sm: number;
      md: number;
    };
    width: {
      thin: string;
    };
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  layout: {
    heroHeight: string;
    flyerHeroHeight: string;
    thumbnailWidth: string;
    thumbnailHeight: number;
    flyerThumbnailHeight: number;
    leftColumnFlex: number;
    rightColumnFlex: number;
  };
};

// Register fonts
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

// Default theme
export const DEFAULT_THEME: PdfTheme = {
  colors: {
    primary: '#2563EB',
    secondary: '#3B82F6',
    text: {
      primary: '#1F2937',
      secondary: '#4B5563',
      light: '#6B7280',
    },
    background: {
      main: '#FFFFFF',
      light: '#F9FAFB',
      dark: '#F3F4F6',
    },
    border: '#E5E7EB',
    imagePlaceholder: '#F3F4F6',
    white: '#FFFFFF',
    textDark: '#111827',
    textMedium: '#374151',
    textLight: '#4B5563',
    textLighter: '#6B7280',
    divider: '#E5E7EB',
    link: '#2563EB',
    overlayBackground: 'rgba(0, 0, 0, 0.2)',
  },
  fonts: {
    primary: 'Montserrat',
    fallback: 'Helvetica',
    sizes: {
      xs: 8,
      sm: 10,
      md: 11,
      lg: 12,
      xl: 14,
      xxl: 18,
      xxxl: 22,
      title: 20,
    },
    weights: {
      normal: 400,
      semibold: 600,
      bold: 700,
    },
  },
  fontSizes: {
    xs: 8,
    sm: 10,
    md: 12,
    lg: 14,
    xl: 18,
    xxl: 24,
  },
  spacing: {
    unit: 8, // Base spacing unit in points
    get xxs() {
      return this.unit * 0.25;
    },
    get xs() {
      return this.unit * 0.5;
    },
    get sm() {
      return this.unit;
    },
    get md() {
      return this.unit * 1.5;
    },
    get lg() {
      return this.unit * 2;
    },
    get xl() {
      return this.unit * 3;
    },
    get xxl() {
      return this.unit * 4;
    },
  },
  borders: {
    radius: {
      sm: 6,
      md: 8,
    },
    width: {
      thin: '1px',
    },
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.5,
  },
  layout: {
    heroHeight: '40%',
    flyerHeroHeight: '30%',
    thumbnailWidth: '32%',
    thumbnailHeight: 120,
    flyerThumbnailHeight: 90,
    leftColumnFlex: 1.6,
    rightColumnFlex: 1,
  },
};
