import { ReactNode } from 'react';
import { IconComponent } from 'twenty-ui';

export type SectionFieldType = 'input' | 'multiLine' | 'field' | 'custom';

export type FieldDefinition = {
  name: string;
  type: SectionFieldType;
  hideLabel?: boolean;
  fieldWidth?: number;
  required?: boolean;
  // Conditionally render the field based on the value of another field
  conditionFields?: string[];
  conditionValues?: string[];
  omitForPublication?: boolean;
  showDescription?: boolean;
};

export type FieldGroup = {
  fields: FieldDefinition[];
  isHorizontal?: boolean;
};

export type EditSectionContentWidth =
  | number
  | 'full'
  | 'half'
  | 'third'
  | 'quarter'
  | 'twoThirds';

export type SectionContent = {
  title: string;
  groups: FieldGroup[];
  width?: EditSectionContentWidth;
  description?: ReactNode;
};

export type Section = {
  id: string;
  title: string;
  content: SectionContent[];
  Icon?: IconComponent;
};
