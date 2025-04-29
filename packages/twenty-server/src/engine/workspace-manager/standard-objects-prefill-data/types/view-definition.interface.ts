import { AGGREGATE_OPERATIONS } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { ViewOpenRecordInType } from 'src/modules/view/standard-objects/view.workspace-entity';

export interface ViewField {
  id?: string;
  fieldMetadataId: string;
  position: number;
  isVisible: boolean;
  size: number;
  aggregateOperation?: AGGREGATE_OPERATIONS;
}

export interface ViewFilter {
  id?: string;
  fieldMetadataId: string;
  displayValue: string;
  operand: string;
  value: string;
}

export interface ViewGroup {
  id?: string;
  fieldMetadataId: string;
  isVisible: boolean;
  fieldValue: string;
  position: number;
}

export interface ViewDefinition {
  id?: string;
  name: string;
  objectMetadataId: string;
  type: string;
  key: string | null;
  position: number;
  icon?: string;
  openRecordIn?: ViewOpenRecordInType;
  kanbanFieldMetadataId?: string;
  kanbanAggregateOperation?: AGGREGATE_OPERATIONS;
  kanbanAggregateOperationFieldMetadataId?: string;
  fields?: ViewField[];
  filters?: ViewFilter[];
  groups?: ViewGroup[];
}
