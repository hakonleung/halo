/**
 * Behaviors API
 */

import { BaseApiService, type ApiResponse } from './base';
import {
  type BehaviorDefinition as ServerBehaviorDefinition,
  type BehaviorRecord as ServerBehaviorRecord,
  type BehaviorRecordWithDefinition as ServerBehaviorRecordWithDefinition,
  type BehaviorDefinitionCreateRequest as ServerBehaviorDefinitionCreateRequest,
  type BehaviorRecordCreateRequest as ServerBehaviorRecordCreateRequest,
  BehaviorCategory,
} from '@/server/types/behavior-server';
import type {
  BehaviorDefinition as ClientBehaviorDefinition,
  BehaviorRecord as ClientBehaviorRecord,
  BehaviorRecordWithDefinition as ClientBehaviorRecordWithDefinition,
  BehaviorDefinitionCreateRequest as ClientBehaviorDefinitionCreateRequest,
  BehaviorRecordCreateRequest as ClientBehaviorRecordCreateRequest,
} from '@/client/types/behavior-client';

function convertBehaviorDefinition(server: ServerBehaviorDefinition): ClientBehaviorDefinition {
  return {
    id: server.id,
    userId: server.user_id ?? null,
    name: server.name,

    category:
      Object.values(BehaviorCategory).find((c) => c === server.category) || BehaviorCategory.Other,
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
    behaviorDefinitions: convertBehaviorDefinition(server.behavior_definitions),
  };
}

// Export converters for reuse in other modules
export { convertBehaviorRecordWithDefinition };

export const behaviorsApi = {
  /**
   * Get behavior records
   */
  async getBehaviorRecords(limit = 50, offset = 0): Promise<ClientBehaviorRecordWithDefinition[]> {
    const response = await BaseApiService.fetchApi<
      ApiResponse<ServerBehaviorRecordWithDefinition[]>
    >(`/api/behaviors/records?limit=${limit}&offset=${offset}`);

    if ('error' in response) {
      throw new Error(response.error);
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

    const response = await BaseApiService.fetchApi<ApiResponse<ServerBehaviorRecord>>(
      '/api/behaviors/records',
      {
        method: 'POST',
        body: JSON.stringify(serverRequest),
      },
    );

    if ('error' in response) {
      throw new Error(response.error);
    }

    return convertBehaviorRecord(response.data);
  },

  /**
   * Update a behavior record
   */
  async updateBehaviorRecord(
    recordId: string,
    updates: Partial<ClientBehaviorRecordCreateRequest>,
  ): Promise<ClientBehaviorRecord> {
    const serverRequest: Partial<ServerBehaviorRecordCreateRequest> = {
      definition_id: updates.definitionId,
      recorded_at: updates.recordedAt,
      metadata: updates.metadata,
      note: updates.note,
    };

    const response = await BaseApiService.fetchApi<ApiResponse<ServerBehaviorRecord>>(
      `/api/behaviors/records/${recordId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(serverRequest),
      },
    );

    if ('error' in response) {
      throw new Error(response.error);
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

    if ('error' in response) {
      throw new Error(response.error);
    }
  },

  /**
   * Get behavior definitions
   */
  async getBehaviorDefinitions(): Promise<ClientBehaviorDefinition[]> {
    const response = await BaseApiService.fetchApi<ApiResponse<ServerBehaviorDefinition[]>>(
      '/api/behaviors/definitions',
    );

    if ('error' in response) {
      throw new Error(response.error);
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

    const response = await BaseApiService.fetchApi<ApiResponse<ServerBehaviorDefinition>>(
      '/api/behaviors/definitions',
      {
        method: 'POST',
        body: JSON.stringify(serverRequest),
      },
    );

    if ('error' in response) {
      throw new Error(response.error);
    }

    return convertBehaviorDefinition(response.data);
  },

  /**
   * Update a behavior definition
   */
  async updateBehaviorDefinition(
    definitionId: string,
    updates: Partial<ClientBehaviorDefinitionCreateRequest>,
  ): Promise<ClientBehaviorDefinition> {
    const serverRequest: Partial<ServerBehaviorDefinitionCreateRequest> = {};
    if (updates.name !== undefined) serverRequest.name = updates.name;
    if (updates.category !== undefined) serverRequest.category = updates.category;
    if (updates.icon !== undefined) serverRequest.icon = updates.icon;
    if (updates.metadataSchema !== undefined)
      serverRequest.metadata_schema = updates.metadataSchema;

    const response = await BaseApiService.fetchApi<ApiResponse<ServerBehaviorDefinition>>(
      `/api/behaviors/definitions/${definitionId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(serverRequest),
      },
    );

    if ('error' in response) {
      throw new Error(response.error);
    }

    return convertBehaviorDefinition(response.data);
  },
};
