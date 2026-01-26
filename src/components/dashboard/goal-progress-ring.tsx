'use client';

import { Box, Text, VStack } from '@chakra-ui/react';
import type { GoalProgress } from '@/types/dashboard-client';

interface GoalProgressRingProps {
  goal: GoalProgress;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const SIZES = {
  sm: { ring: 80, stroke: 6, fontSize: 'md' },
  md: { ring: 100, stroke: 8, fontSize: 'lg' },
  lg: { ring: 120, stroke: 10, fontSize: 'xl' },
};

function getProgressColor(progress: number): string {
  if (progress >= 100) return '#00FF41';
  if (progress >= 70) return '#00FF41';
  if (progress >= 30) return '#00D4FF';
  return '#FF6B35';
}

export function GoalProgressRing({ goal, size = 'md', onClick }: GoalProgressRingProps) {
  const { ring, stroke, fontSize } = SIZES[size];
  const radius = (ring - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(goal.progress, 100);
  const offset = circumference - (progress / 100) * circumference;
  const color = getProgressColor(progress);

  return (
    <VStack
      gap={2}
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      transition="all 0.15s ease"
      _hover={onClick ? { transform: 'scale(1.05)' } : undefined}
    >
      <Box position="relative" w={`${ring}px`} h={`${ring}px`}>
        <svg width={ring} height={ring} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx={ring / 2}
            cy={ring / 2}
            r={radius}
            fill="none"
            stroke="#2A2A2A"
            strokeWidth={stroke}
          />
          {/* Progress circle */}
          <circle
            cx={ring / 2}
            cy={ring / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 0.8s ease-out',
              filter: `drop-shadow(0 0 4px ${color})`,
            }}
          />
        </svg>
        {/* Center text */}
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          textAlign="center"
        >
          <Text
            fontSize={fontSize}
            fontWeight="bold"
            fontFamily="mono"
            color={color}
            lineHeight={1}
          >
            {Math.round(progress)}%
          </Text>
        </Box>
      </Box>
      <Text
        fontSize="xs"
        color="text.mist"
        fontFamily="mono"
        textAlign="center"
        maxW={`${ring}px`}
        lineClamp={1}
      >
        {goal.name}
        {progress >= 100 && ' ✓'}
      </Text>
    </VStack>
  );
}
