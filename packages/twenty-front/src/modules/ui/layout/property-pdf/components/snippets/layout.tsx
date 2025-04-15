import { LAYOUT } from '@/ui/layout/property-pdf/constants/layout';
import { PDF_STYLES } from '@/ui/layout/property-pdf/constants/styles';
import { View } from '@react-pdf/renderer';
import { Style } from '@react-pdf/types';
import { ReactNode } from 'react';

export const Spacer = ({ x = 0, y = 1 }: { x?: number; y?: number }) => {
  return (
    <View
      style={{
        paddingVertical: x ? undefined : LAYOUT.spacing.xs * y,
        paddingHorizontal: x ? LAYOUT.spacing.xs * x : undefined,
      }}
    />
  );
};

export const Filler = () => {
  return <View style={PDF_STYLES.sectionFiller} />;
};

export const Section = ({
  children,
  style = {},
  height = '25%',
  removePadding = false,
  backgroundColor = 'white',
}: {
  children: ReactNode;
  style?: Style;
  height?: string | number;
  removePadding?: boolean;
  backgroundColor?: string;
}) => {
  return (
    <View
      style={[
        PDF_STYLES.section,
        {
          height: height,
          padding: removePadding ? 0 : undefined,
          backgroundColor: backgroundColor,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export const Col = ({
  children,
  style = {},
  width = '100%',
  gap = 1,
}: {
  children: ReactNode;
  style?: Style;
  width?: string | number;
  gap?: number;
}) => {
  return (
    <View
      style={[
        PDF_STYLES.flexColumn,
        style,
        { width: width, gap: gap ? LAYOUT.spacing.sm * gap : undefined },
      ]}
    >
      {children}
    </View>
  );
};

export const Row = ({
  children,
  style = {},
  height = '100%',
  gap = 1,
}: {
  children: ReactNode;
  style?: Style;
  height?: string | number;
  gap?: number;
}) => {
  return (
    <View
      style={[
        PDF_STYLES.flexRow,
        style,
        { height: height, gap: gap ? LAYOUT.spacing.sm * gap : undefined },
      ]}
    >
      {children}
    </View>
  );
};
