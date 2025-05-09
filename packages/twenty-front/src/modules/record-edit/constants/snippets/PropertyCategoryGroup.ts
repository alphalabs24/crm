import { FieldGroup } from '@/record-edit/types/EditSectionTypes';
import { CATEGORY_SUBTYPES } from '../CategorySubtypes';

export const PropertyCategoryGroup: FieldGroup = {
  isHorizontal: true,
  fields: [
    { name: 'category', type: 'field', required: true },
    {
      name: CATEGORY_SUBTYPES.APARTMENT,
      type: 'field',
      required: true,
      conditionFields: ['category'],
      conditionValues: ['apartment'],
    },
    {
      name: CATEGORY_SUBTYPES.HOUSE,
      type: 'field',
      required: true,
      conditionFields: ['category'],
      conditionValues: ['house'],
    },
    {
      name: CATEGORY_SUBTYPES.PLOT,
      type: 'field',
      required: true,
      conditionFields: ['category'],
      conditionValues: ['plot'],
    },
    {
      name: CATEGORY_SUBTYPES.PROPERTY,
      type: 'field',
      required: true,
      conditionFields: ['category'],
      conditionValues: ['property'],
    },
    {
      name: CATEGORY_SUBTYPES.GASTRONOMY,
      type: 'field',
      required: true,
      conditionFields: ['category'],
      conditionValues: ['gastronomy'],
    },
    {
      name: CATEGORY_SUBTYPES.AGRICULTURE,
      type: 'field',
      required: true,
      conditionFields: ['category'],
      conditionValues: ['agriculture'],
    },
    {
      name: CATEGORY_SUBTYPES.PARKING,
      type: 'field',
      required: true,
      conditionFields: ['category'],
      conditionValues: ['parking_space'],
    },
    {
      name: CATEGORY_SUBTYPES.SECONDARY_ROOMS,
      type: 'field',
      required: true,
      conditionFields: ['category'],
      conditionValues: ['secondary_rooms'],
    },
    {
      name: CATEGORY_SUBTYPES.INDUSTRIAL_OBJECTS,
      type: 'field',
      required: true,
      conditionFields: ['category'],
      conditionValues: ['industrial_objects'],
    },
  ],
};
