import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  BehaviorDefinition,
  BehaviorDefinitionCreateRequest,
  BehaviorResponse,
} from '@/types/behavior-client';
import type {
  BehaviorDefinition as ServerBehaviorDefinition,
  BehaviorDefinitionCreateRequest as ServerBehaviorDefinitionCreateRequest,
} from '@/types/behavior-server';
import { createToaster } from '@chakra-ui/react';

const toaster = createToaster({
  placement: 'bottom-end',
});

/**
 * Convert server-side BehaviorDefinition to client-side format
 */
function convertToClientDefinition(serverDef: ServerBehaviorDefinition): BehaviorDefinition {
  return {
    id: serverDef.id,
    userId: serverDef.user_id ?? null,
    name: serverDef.name,
    category: serverDef.category as BehaviorDefinition['category'],
    icon: serverDef.icon ?? undefined,
    metadataSchema: serverDef.metadata_schema,
    usageCount: serverDef.usage_count ?? 0,
    createdAt: serverDef.created_at ?? new Date().toISOString(),
    updatedAt: serverDef.updated_at ?? new Date().toISOString(),
  };
}

/**
 * Convert client-side BehaviorDefinitionCreateRequest to server-side format
 */
function convertToServerRequest(
  clientRequest: BehaviorDefinitionCreateRequest,
): ServerBehaviorDefinitionCreateRequest {
  return {
    name: clientRequest.name,
    category: clientRequest.category,
    icon: clientRequest.icon,
    metadata_schema: clientRequest.metadataSchema,
  };
}

/**
 * Hook to get behavior definitions
 */
export function useBehaviorDefinitions() {
  const {
    data: definitionsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['behavior-definitions'],
    queryFn: async () => {
      const res = await fetch('/api/behaviors/definitions');
      if (!res.ok) {
        throw new Error('Failed to fetch behavior definitions');
      }
      const response = (await res.json()) as BehaviorResponse<ServerBehaviorDefinition[]>;
      if (!response.data) throw response.error;
      return response.data.map(convertToClientDefinition);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    definitions: definitionsData ?? [],
    isLoading,
    error: error?.message ?? null,
  };
}

/**
 * Hook to create a behavior definition
 */
export function useCreateBehaviorDefinition() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (definition: BehaviorDefinitionCreateRequest) => {
      const serverRequest = convertToServerRequest(definition);
      const res = await fetch('/api/behaviors/definitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverRequest),
      });
      if (!res.ok) {
        const error = await res
          .json()
          .catch(() => ({ error: 'Failed to create behavior definition' }));
        throw new Error(error.error || 'Failed to create behavior definition');
      }
      const response = (await res.json()) as BehaviorResponse<ServerBehaviorDefinition>;
      if (!response.data) throw response.error;
      return convertToClientDefinition(response.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['behavior-definitions'] });
      toaster.create({
        title: 'Success',
        description: 'Behavior definition created successfully.',
        type: 'success',
      });
    },
    onError: (error: Error) => {
      toaster.create({
        title: 'Error',
        description: error.message,
        type: 'error',
      });
    },
  });

  return {
    createDefinition: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
}
