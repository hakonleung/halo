import { Box, Flex } from '@chakra-ui/react';
import * as React from 'react';

import type { BoxProps } from '@chakra-ui/react';

interface AvatarProps extends BoxProps {
  name?: string;
  src?: string;
  bg?: string;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>((props, ref) => {
  const { name, src, bg = 'gray.500', ...rest } = props;

  return (
    <Box
      ref={ref}
      width="32px"
      height="32px"
      borderRadius="full"
      overflow="hidden"
      bg={bg}
      position="relative"
      {...rest}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <Flex
          width="full"
          height="full"
          align="center"
          justify="center"
          color="white"
          fontSize="xs"
          fontWeight="bold"
        >
          {name ? name.substring(0, 2).toUpperCase() : '?'}
        </Flex>
      )}
    </Box>
  );
});

export const AvatarRoot = Avatar;
export const AvatarFallback = (props: {
  children: React.ReactNode;
  color?: string;
  fontWeight?: string;
}) => <Flex align="center" justify="center" h="full" w="full" {...props} />;
