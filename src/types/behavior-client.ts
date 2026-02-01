// Client-side types for behaviors
import { BehaviorCategory } from './behavior-server';
import type { MetadataField, MetadataValue, MetadataRecord } from './behavior-server';
export { BehaviorCategory, MetadataField, MetadataValue, MetadataRecord };

export interface BehaviorDefinition {
  id: string;
  userId: string | null;
  name: string;
  category: BehaviorCategory;
  icon?: string;
  metadataSchema: MetadataField[];
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BehaviorRecord {
  id: string;
  userId: string;
  definitionId: string;
  recordedAt: string;
  metadata: MetadataRecord;
  note?: string;
  createdAt: string;
}

export interface BehaviorRecordWithDefinition extends BehaviorRecord {
  behaviorDefinitions: BehaviorDefinition;
}

export interface BehaviorDefinitionCreateRequest {
  name: string;
  category: BehaviorCategory;
  icon?: string;
  metadataSchema?: MetadataField[];
}

export interface BehaviorRecordCreateRequest {
  definitionId: string;
  recordedAt?: string;
  metadata: MetadataRecord;
  note?: string;
}
