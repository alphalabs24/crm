import { FieldGroup } from '../../types/EditSectionTypes';

export const FinancialOverviewGroup: FieldGroup = {
  isHorizontal: true,
  fields: [
    {
      name: 'offerType',
      type: 'field',
      fieldWidth: 150,
      required: true,
    },
    {
      name: 'priceUnit',
      type: 'field',
    },
    {
      name: 'rentNet',
      type: 'input',
      fieldWidth: 150,
      conditionFields: ['offerType'],
      conditionValues: ['rent'],
    },
    {
      name: 'rentExtra',
      type: 'input',
      fieldWidth: 150,
      conditionFields: ['offerType'],
      conditionValues: ['rent'],
    },

    {
      name: 'sellingPrice',
      type: 'input',
      conditionFields: ['offerType'],
      conditionValues: ['sale'],
    },
  ],
};
