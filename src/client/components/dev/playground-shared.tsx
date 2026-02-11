'use client';

import { Heading, Text } from '@chakra-ui/react';

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Heading
      fontFamily="heading"
      fontSize="16px"
      color="brand.matrix"
      textShadow="0 0 8px currentColor"
      borderBottom="1px solid"
      borderColor="rgba(0, 255, 65, 0.3)"
      pb={1}
      mb={3}
    >
      {`// ${children}`}
    </Heading>
  );
}

export function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text fontFamily="mono" fontSize="12px" color="text.mist" mb={2}>
      {`/* ${children} */`}
    </Text>
  );
}
