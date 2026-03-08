/**
 * Error Boundary for 3D Scene
 *
 * Catches errors in 3D scene and provides fallback UI.
 */

import { Box, Button, VStack, Text, Heading } from '@chakra-ui/react';
import { AlertTriangle } from 'lucide-react';
import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class SceneErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('3D Scene Error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Box
          position="absolute"
          top={0}
          left={0}
          w="full"
          h="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="rgba(0, 0, 0, 0.9)"
        >
          <VStack gap={6} maxW="md" p={8}>
            <AlertTriangle size={48} color="#FF6B35" />
            <Heading size="lg" color="brand.matrix" textAlign="center">
              3D SCENE ERROR
            </Heading>
            <Text color="text.mist" textAlign="center">
              The 3D scene encountered an error and could not be rendered. You can try reloading the
              scene or switch back to 2D mode.
            </Text>
            {this.state.error && (
              <Text fontSize="sm" color="text.dim" fontFamily="mono" textAlign="center">
                {this.state.error.message}
              </Text>
            )}
            <VStack gap={3} w="full">
              <Button onClick={this.handleReset} w="full">
                Reload Scene
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // Switch back to 2D mode
                  this.props.onReset?.();
                }}
                w="full"
              >
                Switch to 2D Mode
              </Button>
            </VStack>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}
