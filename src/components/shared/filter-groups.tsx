'use client';

import {
  Box,
  HStack,
  Input,
  Text,
  IconButton,
  Portal,
  VStack,
  MenuRoot,
  Menu,
} from '@chakra-ui/react';
import { LuFilter, LuChevronRight } from 'react-icons/lu';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { ActiveFilterChips } from './active-filter-chips';
import type { FilterGroup } from '@/types/filter';

interface FilterGroupsProps {
  activeFilters: Record<string, string>;
  onFilterChange: (id: string, value: string) => void;
  groups: FilterGroup[];
}

export function FilterGroups({ activeFilters, onFilterChange, groups }: FilterGroupsProps) {
  const [hoveredGroupId, setHoveredGroupId] = useState<string | null>(groups[0]?.id || null);
  const [hoveredFilterId, setHoveredFilterId] = useState<string | null>(
    groups[0]?.filters[0]?.id || null,
  );

  // Sync hovered filter when group changes
  useEffect(() => {
    if (hoveredGroupId) {
      const group = groups.find((g) => g.id === hoveredGroupId);
      if (group && group.filters.length > 0) {
        if (!group.filters.some((f) => f.id === hoveredFilterId)) {
          setHoveredFilterId(group.filters[0].id);
        }
      }
    }
  }, [hoveredGroupId, groups, hoveredFilterId]);

  const selectedGroup = useMemo(
    () => groups.find((g) => g.id === hoveredGroupId),
    [groups, hoveredGroupId],
  );
  const selectedFilterField = useMemo(
    () => selectedGroup?.filters.find((f) => f.id === hoveredFilterId),
    [selectedGroup, hoveredFilterId],
  );

  return (
    <AnimatePresence mode="popLayout">
      <MenuRoot positioning={{ placement: 'bottom-start' }}>
        <Menu.Trigger asChild>
          <IconButton
            variant="outline"
            aria-label="Add Filter"
            borderColor="rgba(0, 255, 65, 0.2)"
            color="brand.matrix"
            _hover={{ bg: 'rgba(0, 255, 65, 0.1)', borderColor: 'brand.matrix' }}
          >
            <LuFilter size={14} />
          </IconButton>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content
              bg="bg.carbon"
              borderColor="brand.matrix"
              minW={{ base: '90vw', md: '450px' }}
              p={0}
              overflow="hidden"
              zIndex="popover"
            >
              <HStack gap={0} align="stretch" h="300px">
                {/* Column 1: Groups & Fields Combined */}
                <VStack
                  w={{ base: '140px', md: '180px' }}
                  align="stretch"
                  gap={0}
                  borderRight="1px solid"
                  borderColor="rgba(0, 255, 65, 0.1)"
                  py={1}
                  bg="rgba(0, 255, 65, 0.02)"
                  overflowY="auto"
                  css={{
                    '&::-webkit-scrollbar': { width: '2px' },
                    '&::-webkit-scrollbar-thumb': { background: 'rgba(0, 255, 65, 0.2)' },
                  }}
                >
                  {groups.map((group) => (
                    <Box key={group.id}>
                      <Text
                        px={3}
                        py={2}
                        fontSize="2xs"
                        color="text.dim"
                        fontFamily="mono"
                        textTransform="uppercase"
                        letterSpacing="widest"
                        bg="rgba(0, 0, 0, 0.2)"
                      >
                        {group.label}
                      </Text>
                      {group.filters.map((filter) => (
                        <Box
                          key={filter.id}
                          px={3}
                          py={2}
                          cursor="pointer"
                          onMouseEnter={() => {
                            setHoveredGroupId(group.id);
                            setHoveredFilterId(filter.id);
                          }}
                          bg={
                            hoveredFilterId === filter.id ? 'rgba(0, 255, 65, 0.1)' : 'transparent'
                          }
                          color={hoveredFilterId === filter.id ? 'brand.matrix' : 'text.mist'}
                          _hover={{ color: 'brand.matrix', bg: 'rgba(0, 255, 65, 0.05)' }}
                          transition="all 0.2s"
                          position="relative"
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Text fontFamily="mono" fontSize="xs" truncate>
                            {filter.label}
                          </Text>
                          <LuChevronRight
                            size={10}
                            opacity={hoveredFilterId === filter.id ? 1 : 0.3}
                          />
                          {hoveredFilterId === filter.id && (
                            <Box
                              position="absolute"
                              left={0}
                              top={0}
                              bottom={0}
                              w="2px"
                              bg="brand.matrix"
                              boxShadow="0 0 10px #00FF41"
                            />
                          )}
                        </Box>
                      ))}
                    </Box>
                  ))}
                </VStack>

                {/* Column 2: Values */}
                <VStack
                  flex={1}
                  align="stretch"
                  gap={0}
                  py={1}
                  bg="rgba(0, 0, 0, 0.2)"
                  overflowY="auto"
                  css={{
                    '&::-webkit-scrollbar': { width: '2px' },
                    '&::-webkit-scrollbar-thumb': { background: 'rgba(0, 255, 65, 0.2)' },
                  }}
                >
                  <Text
                    px={3}
                    py={2}
                    fontSize="2xs"
                    color="text.dim"
                    fontFamily="mono"
                    textTransform="uppercase"
                    letterSpacing="widest"
                  >
                    Values
                  </Text>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={hoveredFilterId}
                      initial={{ opacity: 0, x: 5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      transition={{ duration: 0.15 }}
                      style={{ width: '100%' }}
                    >
                      {selectedFilterField?.type === 'search' ? (
                        <Box px={3} py={2}>
                          <VStack align="stretch" gap={2}>
                            <Text fontSize="2xs" color="brand.matrix" fontFamily="mono">
                              PRESS ENTER TO APPLY
                            </Text>
                            <Input
                              placeholder="Type to search..."
                              value={activeFilters[selectedFilterField.id] || ''}
                              onChange={(e) =>
                                onFilterChange(selectedFilterField.id, e.target.value)
                              }
                              autoFocus
                              bg="rgba(0, 0, 0, 0.4)"
                              borderColor="brand.matrix"
                              color="white"
                              fontFamily="mono"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  // The menu might need to close manually or we let it be
                                }
                              }}
                            />
                          </VStack>
                        </Box>
                      ) : (
                        selectedFilterField?.options.map((option) => (
                          <Menu.Item
                            key={option.value}
                            value={option.value}
                            onClick={() => onFilterChange(selectedFilterField.id, option.value)}
                            px={3}
                            py={2}
                            color={
                              activeFilters[selectedFilterField.id] === option.value
                                ? 'brand.matrix'
                                : 'text.mist'
                            }
                            _hover={{ bg: 'rgba(0, 255, 65, 0.1)', color: 'brand.matrix' }}
                            fontFamily="mono"
                            fontSize="xs"
                            borderRadius={0}
                            w="full"
                            closeOnSelect
                          >
                            <HStack justify="space-between" w="full">
                              <Text truncate>{option.label}</Text>
                              {activeFilters[selectedFilterField.id] === option.value && (
                                <Box
                                  w="6px"
                                  h="6px"
                                  borderRadius="full"
                                  bg="brand.matrix"
                                  boxShadow="0 0 8px #00FF41"
                                />
                              )}
                            </HStack>
                          </Menu.Item>
                        ))
                      )}
                    </motion.div>
                  </AnimatePresence>
                </VStack>
              </HStack>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </MenuRoot>
      <ActiveFilterChips
        activeFilters={activeFilters}
        onFilterChange={onFilterChange}
        groups={groups}
      />
    </AnimatePresence>
  );
}
