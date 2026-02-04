'use client';

import { DatePicker as ArkDatePicker, Portal, type UseDatePickerContext } from '@ark-ui/react';
import { Box, Button, IconButton, Input, Text, HStack, VStack } from '@chakra-ui/react';
import { LuCalendar, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import * as React from 'react';

export interface DatePickerProps extends ArkDatePicker.RootProps {
  placeholder?: string;
}

export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>((props, ref) => {
  const { placeholder, ...rest } = props;

  return (
    <ArkDatePicker.Root {...rest} ref={ref}>
      <ArkDatePicker.Control>
        <Box position="relative" display="inline-block">
          <ArkDatePicker.Input asChild>
            <Input
              size="sm"
              pl="10"
              placeholder={placeholder || 'Select date'}
              bg="rgba(0, 0, 0, 0.3)"
              borderColor="rgba(0, 255, 65, 0.2)"
              _focus={{
                borderColor: 'brand.matrix',
                boxShadow: '0 0 10px rgba(0, 255, 65, 0.2)',
              }}
              fontFamily="mono"
            />
          </ArkDatePicker.Input>
          <ArkDatePicker.Trigger asChild>
            <Box
              position="absolute"
              left="3"
              top="50%"
              transform="translateY(-50%)"
              color="brand.matrix"
              cursor="pointer"
            >
              <LuCalendar size={14} />
            </Box>
          </ArkDatePicker.Trigger>
        </Box>
      </ArkDatePicker.Control>

      <Portal>
        <ArkDatePicker.Positioner>
          <ArkDatePicker.Content asChild>
            <Box
              bg="bg.carbon"
              border="1px solid"
              borderColor="brand.matrix"
              p="4"
              borderRadius="4px"
              boxShadow="0 0 20px rgba(0, 255, 65, 0.1)"
              backdropFilter="blur(10px)"
              zIndex="popover"
            >
              <ArkDatePicker.View view="day">
                <VStack align="stretch" gap="4">
                  <ArkDatePicker.Context>
                    {(api: UseDatePickerContext) => (
                      <HStack justify="space-between">
                        <ArkDatePicker.PrevTrigger asChild>
                          <IconButton
                            size="xs"
                            variant="ghost"
                            color="brand.matrix"
                            aria-label="Previous month"
                          >
                            <LuChevronLeft />
                          </IconButton>
                        </ArkDatePicker.PrevTrigger>
                        <ArkDatePicker.ViewTrigger asChild>
                          <Button size="xs" variant="ghost" color="brand.matrix" fontFamily="mono">
                            {api.visibleRangeText.start}
                          </Button>
                        </ArkDatePicker.ViewTrigger>
                        <ArkDatePicker.NextTrigger asChild>
                          <IconButton
                            size="xs"
                            variant="ghost"
                            color="brand.matrix"
                            aria-label="Next month"
                          >
                            <LuChevronRight />
                          </IconButton>
                        </ArkDatePicker.NextTrigger>
                      </HStack>
                    )}
                  </ArkDatePicker.Context>

                  <ArkDatePicker.Table>
                    <ArkDatePicker.TableHead>
                      <ArkDatePicker.TableRow>
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                          <ArkDatePicker.TableHeader key={day}>
                            <Text fontSize="xs" color="text.mist" textAlign="center" w="8">
                              {day}
                            </Text>
                          </ArkDatePicker.TableHeader>
                        ))}
                      </ArkDatePicker.TableRow>
                    </ArkDatePicker.TableHead>
                    <ArkDatePicker.TableBody>
                      <ArkDatePicker.Context>
                        {(api: UseDatePickerContext) =>
                          api.weeks.map((week, id) => (
                            <ArkDatePicker.TableRow key={id}>
                              {week.map((day, id) => (
                                <ArkDatePicker.TableCell key={id} value={day}>
                                  <ArkDatePicker.TableCellTrigger asChild>
                                    <Button
                                      size="xs"
                                      variant="ghost"
                                      w="8"
                                      h="8"
                                      p="0"
                                      color={
                                        api.value.some((v) => v.toString() === day.toString())
                                          ? 'black'
                                          : 'brand.matrix'
                                      }
                                      bg={
                                        api.value.some((v) => v.toString() === day.toString())
                                          ? 'brand.matrix'
                                          : 'transparent'
                                      }
                                      _hover={{
                                        bg: api.value.some((v) => v.toString() === day.toString())
                                          ? 'brand.matrix'
                                          : 'rgba(0, 255, 65, 0.1)',
                                      }}
                                      _disabled={{
                                        color: 'text.dim',
                                        cursor: 'not-allowed',
                                      }}
                                    >
                                      {day.day}
                                    </Button>
                                  </ArkDatePicker.TableCellTrigger>
                                </ArkDatePicker.TableCell>
                              ))}
                            </ArkDatePicker.TableRow>
                          ))
                        }
                      </ArkDatePicker.Context>
                    </ArkDatePicker.TableBody>
                  </ArkDatePicker.Table>
                </VStack>
              </ArkDatePicker.View>
            </Box>
          </ArkDatePicker.Content>
        </ArkDatePicker.Positioner>
      </Portal>
    </ArkDatePicker.Root>
  );
});

DatePicker.displayName = 'DatePicker';
