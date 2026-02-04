'use client';

import { Box, HStack, Text, Portal, MenuRoot, Menu } from '@chakra-ui/react';
import { LuChevronDown, LuX } from 'react-icons/lu';
import { motion } from 'framer-motion';
import type { FilterGroup } from '@/client/types/filter';

export function ActiveFilterChips({
  activeFilters,
  onFilterChange,
  groups,
}: {
  activeFilters: Record<string, string>;
  onFilterChange: (id: string, value: string) => void;
  groups: FilterGroup[];
}) {
  const activeEntries = Object.entries(activeFilters).filter(
    ([_, value]) => value !== 'all' && value !== '',
  );

  if (activeEntries.length === 0) return null;

  return (
    <>
      {activeEntries.map(([id, value]) => {
        // Find label and filter config
        let label = value;
        let filterLabel = id;
        let filterConfig = null;

        for (const g of groups) {
          const f = g.filters.find((filter) => filter.id === id);
          if (f) {
            filterLabel = f.label;
            filterConfig = f;
            if (f.type === 'select') {
              const opt = f.options.find((o) => o.value === value);
              if (opt) label = opt.label;
            }
            break;
          }
        }

        const isSearch = filterConfig?.type === 'search';

        const chipContent = (
          <HStack
            bg="rgba(0, 255, 65, 0.05)"
            border="1px solid"
            borderColor="rgba(0, 255, 65, 0.3)"
            px={2}
            py={1}
            borderRadius="2px"
            cursor={isSearch ? 'default' : 'pointer'}
            _hover={{
              bg: 'rgba(0, 255, 65, 0.1)',
              borderColor: 'brand.matrix',
              boxShadow: '0 0 8px rgba(0, 255, 65, 0.1)',
            }}
            gap={1}
            transition="all 0.2s"
          >
            <Text fontSize="2xs" color="text.dim" fontFamily="mono" textTransform="uppercase">
              {filterLabel}
            </Text>
            <Text fontSize="xs" color="brand.matrix" fontWeight="bold" fontFamily="mono">
              {label}
            </Text>
            {!isSearch && <LuChevronDown size={10} color="var(--chakra-colors-brand-matrix)" />}
            <Box
              as="span"
              display="flex"
              alignItems="center"
              justifyContent="center"
              ml={1}
              onClick={(e) => {
                e.stopPropagation();
                onFilterChange(id, isSearch ? '' : 'all');
              }}
              cursor="pointer"
              borderRadius="2px"
              color="brand.alert"
              _hover={{ color: 'white', bg: 'rgba(255, 107, 53, 0.2)' }}
            >
              <LuX size={10} />
            </Box>
          </HStack>
        );

        return (
          <motion.div
            key={id}
            layout
            initial={{ opacity: 0, scale: 0.9, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -5 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {isSearch ? (
              chipContent
            ) : (
              <MenuRoot>
                <Menu.Trigger asChild>{chipContent}</Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content
                      bg="bg.carbon"
                      borderColor="brand.matrix"
                      minW="120px"
                      zIndex="popover"
                    >
                      {filterConfig?.type === 'select' &&
                        filterConfig.options.map((option) => (
                          <Menu.Item
                            key={option.value}
                            value={option.value}
                            onClick={() => onFilterChange(id, option.value)}
                            color={
                              activeFilters[id] === option.value ? 'brand.matrix' : 'text.mist'
                            }
                            _hover={{ bg: 'rgba(0, 255, 65, 0.1)', color: 'brand.matrix' }}
                            fontFamily="mono"
                            fontSize="xs"
                          >
                            {option.label}
                          </Menu.Item>
                        ))}
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </MenuRoot>
            )}
          </motion.div>
        );
      })}

      <motion.div layout>
        <Text
          fontSize="2xs"
          color="text.dim"
          cursor="pointer"
          onClick={() => {
            Object.keys(activeFilters).forEach((id) => {
              let isSearch = false;
              for (const g of groups) {
                const f = g.filters.find((filter) => filter.id === id);
                if (f) {
                  isSearch = f.type === 'search';
                  break;
                }
              }
              onFilterChange(id, isSearch ? '' : 'all');
            });
          }}
          ml={2}
          fontFamily="mono"
          textTransform="uppercase"
          borderBottom="1px solid transparent"
          _hover={{ color: 'brand.alert', borderBottomColor: 'brand.alert' }}
        >
          [ Clear All ]
        </Text>
      </motion.div>
    </>
  );
}
