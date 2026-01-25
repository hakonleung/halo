import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { neologBehaviorDefinitions, neologBehaviorRecords } from '@/db/schema';

// Server-side types for behaviors (Inferred from Drizzle Entity)
export type BehaviorDefinition = InferSelectModel<typeof neologBehaviorDefinitions> & {
  metadata_schema: MetadataField[];
};

export type BehaviorRecord = InferSelectModel<typeof neologBehaviorRecords> & {
  metadata: MetadataRecord;
};

export type BehaviorCategory = 'health' | 'expense' | 'income' | 'habit' | 'other';

export type MetadataValue = string | number | boolean | string[] | number[] | null;
export type MetadataRecord = Record<string, MetadataValue>;

export interface BaseMetadataField {
  name: string;
  key: string;
  required: boolean;
}

export interface NumberMetadataField extends BaseMetadataField {
  type: 'number';
  config: {
    min?: number;
    max?: number;
    decimals?: number;
    defaultValue?: number;
    placeholder?: string;
  };
}

export interface NumberUnitMetadataField extends BaseMetadataField {
  type: 'number_unit';
  config: {
    min?: number;
    max?: number;
    units: string[];
    defaultUnit?: string;
    defaultValue?: number;
    placeholder?: string;
  };
}

export interface TextMetadataField extends BaseMetadataField {
  type: 'text' | 'textarea';
  config: {
    defaultValue?: string;
    placeholder?: string;
  };
}

export interface SelectMetadataField extends BaseMetadataField {
  type: 'select' | 'multiselect';
  config: {
    options: { label: string; value: string }[];
    defaultValue?: string | string[];
    placeholder?: string;
  };
}

export interface DateMetadataField extends BaseMetadataField {
  type: 'date' | 'time' | 'datetime';
  config: {
    defaultValue?: string;
  };
}

export interface RatingMetadataField extends BaseMetadataField {
  type: 'rating';
  config: {
    maxRating: number;
    defaultValue?: number;
  };
}

export interface CurrencyMetadataField extends BaseMetadataField {
  type: 'currency';
  config: {
    currency: string;
    defaultValue?: number;
    placeholder?: string;
  };
}

export type MetadataField =
  | NumberMetadataField
  | NumberUnitMetadataField
  | TextMetadataField
  | SelectMetadataField
  | DateMetadataField
  | RatingMetadataField
  | CurrencyMetadataField;

export interface BehaviorRecordWithDefinition extends BehaviorRecord {
  behavior_definitions: BehaviorDefinition;
}

export type BehaviorDefinitionCreateRequest = Partial<InferInsertModel<typeof neologBehaviorDefinitions>> & {
  metadata_schema?: MetadataField[];
};

export type BehaviorRecordCreateRequest = Partial<InferInsertModel<typeof neologBehaviorRecords>> & {
  metadata: MetadataRecord;
};

export interface BehaviorResponse<T> {
  data: T | null;
  error: string | null;
}
