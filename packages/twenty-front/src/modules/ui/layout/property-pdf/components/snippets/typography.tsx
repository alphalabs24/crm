import { PDF_STYLES } from '@/ui/layout/property-pdf/constants/styles';
import { Text, View } from '@react-pdf/renderer';
import { Style } from '@react-pdf/types';
import { ReactNode } from 'react';

export const Spacer = () => {
  return <View style={PDF_STYLES.spacer} />;
};

type Variant = 'default' | 'white';

export const H1 = ({
  children,
  variant = 'default',
  style = {},
  uppercase = false,
  align = 'left',
}: {
  children: ReactNode;
  variant?: Variant;
  style?: Style;
  uppercase?: boolean;
  align?: 'left' | 'right' | 'center';
}) => {
  const variantStyle =
    variant === 'white' ? PDF_STYLES.heading1White : PDF_STYLES.heading1;
  return (
    <Text
      style={[
        variantStyle,
        style,
        {
          textTransform: uppercase ? 'uppercase' : undefined,
          textAlign: align,
        },
      ]}
    >
      {children}
    </Text>
  );
};

export const H2 = ({
  children,
  variant = 'default',
  style = {},
  uppercase = false,
  align = 'left',
}: {
  children: ReactNode;
  variant?: Variant;
  style?: Style;
  uppercase?: boolean;
  align?: 'left' | 'right' | 'center';
}) => {
  const variantStyle =
    variant === 'white' ? PDF_STYLES.heading2White : PDF_STYLES.heading2;
  return (
    <Text
      style={[
        variantStyle,
        style,
        {
          textTransform: uppercase ? 'uppercase' : undefined,
          textAlign: align,
        },
      ]}
    >
      {children}
    </Text>
  );
};

export const H3 = ({
  children,
  variant = 'default',
  style = {},
  uppercase = false,
}: {
  children: ReactNode;
  variant?: Variant;
  style?: Style;
  uppercase?: boolean;
}) => {
  const variantStyle =
    variant === 'white' ? PDF_STYLES.heading3White : PDF_STYLES.heading3;
  return (
    <Text
      style={[
        variantStyle,
        style,
        { textTransform: uppercase ? 'uppercase' : undefined },
      ]}
    >
      {children}
    </Text>
  );
};

export const Body = ({
  children,
  style = {},
  align = 'left',
}: {
  children: ReactNode;
  style?: Style;
  align?: 'left' | 'right' | 'center';
}) => {
  return (
    <Text style={[PDF_STYLES.bodyText, style, { textAlign: align }]}>
      {children}
    </Text>
  );
};
