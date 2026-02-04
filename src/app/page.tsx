'use client';

import { Box, Text, VStack, Spinner } from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/client/hooks/use-user';
import { AuthForm } from '@/client/components/auth/auth-form';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useUser();
  const redirectTo = searchParams.get('redirect') || '/log';

  // 如果已登录，跳转到目标页面
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  // 加载中状态
  if (isLoading) {
    return (
      <Box
        bg="transparent"
        minH="100vh"
        color="text.neon"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        zIndex={1}
      >
        <VStack gap={4}>
          <Spinner color="brand.matrix" />
          <Text fontFamily="mono" color="text.mist">
            [ LOADING... ]
          </Text>
        </VStack>
      </Box>
    );
  }

  // 如果已登录，显示加载中（等待跳转）
  if (isAuthenticated) {
    return (
      <Box
        bg="transparent"
        minH="100vh"
        color="text.neon"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        zIndex={1}
      >
        <VStack gap={4}>
          <Spinner color="brand.matrix" />
          <Text fontFamily="mono" color="text.mist">
            [ REDIRECTING... ]
          </Text>
        </VStack>
      </Box>
    );
  }

  // 未登录，显示登录表单
  return <AuthForm />;
}
