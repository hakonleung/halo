'use client';

import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Input,
  HStack,
  Spinner,
  Field,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  loginSchema,
  signupSchema,
  type LoginFormData,
  type SignupFormData,
} from '@/utils/auth-schemas';
import { checkPasswordStrength } from '@/utils/auth-pure';
import { useLogin } from '@/hooks/use-login';
import { useSignup } from '@/hooks/use-signup';
import { useState } from 'react';

type AuthMode = 'login' | 'signup';

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login, isLoading: isLoginLoading, error: loginError } = useLogin();
  const { signup, isLoading: isSignupLoading, error: signupError } = useSignup();

  const isLoading = isLoginLoading || isSignupLoading;
  const error = loginError || signupError;

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const password = mode === 'login' ? loginForm.watch('password') : signupForm.watch('password');
  const passwordStrength = password ? checkPasswordStrength(password) : undefined;

  const onLogin = async (data: LoginFormData) => {
    try {
      await login({ email: data.email, password: data.password });
    } catch {
      // Error is handled by hook
    }
  };

  const onSignup = async (data: SignupFormData) => {
    try {
      await signup({ email: data.email, password: data.password });
    } catch {
      // Error is handled by hook
    }
  };

  const onSubmit =
    mode === 'login' ? loginForm.handleSubmit(onLogin) : signupForm.handleSubmit(onSignup);

  const strengthConfig = {
    weak: { value: 33, color: 'red.500', label: 'Weak' },
    medium: { value: 66, color: 'yellow.500', label: 'Medium' },
    strong: { value: 100, color: 'brand.matrix', label: 'Strong' },
  };

  const strength = passwordStrength ? strengthConfig[passwordStrength] : null;

  return (
    <Box
      position="relative"
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="bg.deep"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 65, 0.05) 2px,
            rgba(0, 255, 65, 0.05) 4px
          )
        `,
        backgroundSize: '40px 40px',
      }}
    >
      <Box
        position="relative"
        zIndex={1}
        bg="bg.carbon"
        border="1px solid"
        borderColor="brand.matrix"
        borderRadius="4px"
        p={8}
        maxW="400px"
        w="100%"
        boxShadow="0 0 15px rgba(0, 255, 65, 0.1)"
      >
        <VStack gap={6} align="stretch">
          <Box textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              color="brand.matrix"
              fontFamily="heading"
              textShadow="0 0 10px currentColor"
              mb={2}
            >
              NEO-LOG
            </Heading>
            <Text color="text.mist" fontFamily="mono" fontSize="sm">
              [ {mode === 'login' ? 'SYSTEM LOGIN' : 'SYSTEM REGISTER'} ]
            </Text>
          </Box>

          <HStack gap={2} justify="center" mb={4}>
            <Button
              variant={mode === 'login' ? 'solid' : 'outline'}
              size="sm"
              onClick={() => {
                setMode('login');
                loginForm.reset();
                signupForm.reset();
              }}
              borderColor="brand.matrix"
              color={mode === 'login' ? 'bg.deep' : 'brand.matrix'}
              bg={mode === 'login' ? 'brand.matrix' : 'transparent'}
              _hover={{ bg: mode === 'login' ? 'brand.matrix' : 'rgba(0, 255, 65, 0.1)' }}
            >
              Sign In
            </Button>
            <Button
              variant={mode === 'signup' ? 'solid' : 'outline'}
              size="sm"
              onClick={() => {
                setMode('signup');
                loginForm.reset();
                signupForm.reset();
              }}
              borderColor="brand.matrix"
              color={mode === 'signup' ? 'bg.deep' : 'brand.matrix'}
              bg={mode === 'signup' ? 'brand.matrix' : 'transparent'}
              _hover={{ bg: mode === 'signup' ? 'brand.matrix' : 'rgba(0, 255, 65, 0.1)' }}
            >
              Sign Up
            </Button>
          </HStack>

          <Box as="form" onSubmit={onSubmit}>
            <VStack gap={4} align="stretch">
              <Field.Root
                invalid={
                  !!(mode === 'login'
                    ? loginForm.formState.errors.email
                    : signupForm.formState.errors.email)
                }
              >
                <Field.Label color="text.mist" fontFamily="mono" fontSize="sm" mb={2}>
                  Email
                </Field.Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  {...(mode === 'login'
                    ? loginForm.register('email')
                    : signupForm.register('email'))}
                />
                <Field.ErrorText mt={1} fontSize="xs" color="red.500" fontFamily="mono">
                  {
                    (mode === 'login'
                      ? loginForm.formState.errors.email
                      : signupForm.formState.errors.email
                    )?.message
                  }
                </Field.ErrorText>
              </Field.Root>

              <Field.Root
                invalid={
                  !!(mode === 'login'
                    ? loginForm.formState.errors.password
                    : signupForm.formState.errors.password)
                }
              >
                <Field.Label color="text.mist" fontFamily="mono" fontSize="sm" mb={2}>
                  Password
                </Field.Label>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...(mode === 'login'
                    ? loginForm.register('password')
                    : signupForm.register('password'))}
                />
                <Field.ErrorText mt={1} fontSize="xs" color="red.500" fontFamily="mono">
                  {
                    (mode === 'login'
                      ? loginForm.formState.errors.password
                      : signupForm.formState.errors.password
                    )?.message
                  }
                </Field.ErrorText>
                {strength && (
                  <Box mt={2}>
                    <Box
                      h="4px"
                      bg="bg.dark"
                      borderRadius="2px"
                      position="relative"
                      overflow="hidden"
                    >
                      <Box
                        h="100%"
                        w={`${strength.value}%`}
                        bg={strength.color}
                        transition="width 0.3s"
                      />
                    </Box>
                    <Box
                      mt={1}
                      fontSize="xs"
                      color={strength.color}
                      fontFamily="mono"
                      textAlign="right"
                    >
                      {strength.label}
                    </Box>
                  </Box>
                )}
                <HStack mt={2} justify="flex-end">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                    borderColor="brand.matrix"
                    color="brand.matrix"
                    _hover={{ bg: 'rgba(0, 255, 65, 0.1)' }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </Button>
                </HStack>
              </Field.Root>

              {mode === 'signup' && (
                <Field.Root invalid={!!signupForm.formState.errors.confirmPassword}>
                  <Field.Label color="text.mist" fontFamily="mono" fontSize="sm" mb={2}>
                    Confirm Password
                  </Field.Label>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...signupForm.register('confirmPassword')}
                  />
                  <Field.ErrorText mt={1} fontSize="xs" color="red.500" fontFamily="mono">
                    {signupForm.formState.errors.confirmPassword?.message}
                  </Field.ErrorText>
                  <HStack mt={2} justify="flex-end">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      type="button"
                      borderColor="brand.matrix"
                      color="brand.matrix"
                      _hover={{ bg: 'rgba(0, 255, 65, 0.1)' }}
                    >
                      {showConfirmPassword ? 'Hide' : 'Show'}
                    </Button>
                  </HStack>
                </Field.Root>
              )}

              {error && (
                <Box
                  p={3}
                  bg="rgba(255, 51, 102, 0.1)"
                  border="1px solid"
                  borderColor="red.500"
                  borderRadius="4px"
                  color="red.500"
                  fontSize="sm"
                  fontFamily="mono"
                >
                  {error}
                </Box>
              )}

              <Button type="submit" w="100%" disabled={isLoading}>
                {isLoading ? <Spinner size="sm" /> : mode === 'login' ? 'Sign In' : 'Sign Up'}
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}
