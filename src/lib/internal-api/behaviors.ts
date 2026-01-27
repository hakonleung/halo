/**
 * Behaviors API
 */

import { BaseApiService, type ApiResponse } from './base';
import type {
  BehaviorDefinition as ServerBehaviorDefinition,
  BehaviorRecord as ServerBehaviorRecord,
  BehaviorRecordWithDefinition as ServerBehaviorRecordWithDefinition,
  BehaviorDefinitionCreateRequest as ServerBehaviorDefinitionCreateRequest,
  BehaviorRecordCreateRequest as ServerBehaviorRecordCreateRequest,
  BehaviorResponse as ServerBehaviorResponse,
} from '@/types/behavior-server';
import type {
  BehaviorDefinition as ClientBehaviorDefinition,
  BehaviorRecord as ClientBehaviorRecord,
  BehaviorRecordWithDefinition as ClientBehaviorRecordWithDefinition,
  BehaviorDefinitionCreateRequest as ClientBehaviorDefinitionCreateRequest,
  BehaviorRecordCreateRequest as ClientBehaviorRecordCreateRequest,
} from '@/types/behavior-client';

function convertBehaviorDefinition(server: ServerBehaviorDefinition): ClientBehaviorDefinition {
  return {
    id: server.id,
    userId: server.user_id ?? null,
    name: server.name,
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    category: server.category as ClientBehaviorDefinition['category'],
    icon: server.icon ?? undefined,
    metadataSchema: server.metadata_schema,
    usageCount: server.usage_count ?? 0,
    createdAt: server.created_at ?? new Date().toISOString(),
    updatedAt: server.updated_at ?? new Date().toISOString(),
  };
}

function convertBehaviorRecord(server: ServerBehaviorRecord): ClientBehaviorRecord {
  return {
    id: server.id,
    userId: server.user_id,
    definitionId: server.definition_id,
    recordedAt: server.recorded_at,
    metadata: server.metadata,
    note: server.note ?? undefined,
    createdAt: server.created_at ?? new Date().toISOString(),
  };
}

function convertBehaviorRecordWithDefinition(
  server: ServerBehaviorRecordWithDefinition,
): ClientBehaviorRecordWithDefinition {
  return {
    ...convertBehaviorRecord(server),
    behavior_definitions: convertBehaviorDefinition(server.behavior_definitions),
  };
}

export const behaviorsApi = {
  /**
   * Get behavior records
   */
  async getBehaviorRecords(limit = 50, offset = 0): Promise<ClientBehaviorRecordWithDefinition[]> {
    const response = await BaseApiService.fetchApi<
      ServerBehaviorResponse<ServerBehaviorRecordWithDefinition[]>
    >(`/api/behaviors/records?limit=${limit}&offset=${offset}`);

    if (!response.data) {
      throw new Error(response.error || 'Failed to fetch behavior records');
    }

    return response.data.map(convertBehaviorRecordWithDefinition);
  },

  /**
   * Create a behavior record
   */
  async createBehaviorRecord(
    record: ClientBehaviorRecordCreateRequest,
  ): Promise<ClientBehaviorRecord> {
    const serverRequest: ServerBehaviorRecordCreateRequest = {
      definition_id: record.definitionId,
      recorded_at: record.recordedAt ?? new Date().toISOString(),
      metadata: record.metadata,
      note: record.note,
    };

    const response = await BaseApiService.fetchApi<ServerBehaviorResponse<ServerBehaviorRecord>>(
      '/api/behaviors/records',
      {
        method: 'POST',
        body: JSON.stringify(serverRequest),
      },
    );

    if (!response.data) {
      throw new Error(response.error || 'Failed to create behavior record');
    }

    return convertBehaviorRecord(response.data);
  },

  /**
   * Delete a behavior record
   */
  async deleteBehaviorRecord(recordId: string): Promise<void> {
    const response = await BaseApiService.fetchApi<ApiResponse<null>>(
      `/api/behaviors/records/${recordId}`,
      {
        method: 'DELETE',
      },
    );

    if (response.error) {
      throw new Error(response.error);
    }
  },

  /**
   * Get behavior definitions
   */
  async getBehaviorDefinitions(): Promise<ClientBehaviorDefinition[]> {
    const response = await BaseApiService.fetchApi<
      ServerBehaviorResponse<ServerBehaviorDefinition[]>
    >('/api/behaviors/definitions');

    if (!response.data) {
      throw new Error(response.error || 'Failed to fetch behavior definitions');
    }

    return response.data.map(convertBehaviorDefinition);
  },

  /**
   * Create a behavior definition
   */
  async createBehaviorDefinition(
    definition: ClientBehaviorDefinitionCreateRequest,
  ): Promise<ClientBehaviorDefinition> {
    const serverRequest: ServerBehaviorDefinitionCreateRequest = {
      name: definition.name,
      category: definition.category,
      icon: definition.icon,
      metadata_schema: definition.metadataSchema,
    };

    const response = await BaseApiService.fetchApi<
      ServerBehaviorResponse<ServerBehaviorDefinition>
    >('/api/behaviors/definitions', {
      method: 'POST',
      body: JSON.stringify(serverRequest),
    });

    if (!response.data) {
      throw new Error(response.error || 'Failed to create behavior definition');
    }

    return convertBehaviorDefinition(response.data);
  },
};
