'use client';

import { useMemo } from 'react';

import { DetailSection } from '../forms/detail-section';

import type { BehaviorDefinition } from '@/client/types/behavior-client';
import type { GoalCriteria } from '@/client/types/goal-client';

export function CriteriaDetail({
  criteria,
  definitions,
}: {
  criteria: GoalCriteria[];
  definitions: BehaviorDefinition[];
}) {
  if (!criteria || criteria.length === 0) return null;
  const items = useMemo(
    () =>
      criteria.map((criterion, index) => {
        const behaviorDef = definitions.find((d) => d.id === criterion.behaviorId);
        const behaviorName = behaviorDef?.name || criterion.behaviorId;

        // Convert criterion to expression form: metric_period(behavior) operator target
        const codeBlock = `${criterion.metric}_${criterion.period}(${behaviorName}) ${criterion.operator} ${criterion.value}`;

        return {
          key: `criterion-${index}`,
          label: '',
          description: criterion.description || undefined,
          codeBlock,
        };
      }),
    [criteria, definitions],
  );
  return <DetailSection title="Completion Criteria" items={items} mode="criteria" />;
}
