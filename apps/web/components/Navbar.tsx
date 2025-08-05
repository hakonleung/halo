'use client';

import type { User } from '@halo/models';
import { useState, useEffect } from 'react';

import { LoginModal } from './LoginModal';
import { Button } from './ui/button';

export function Navbar() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.user) {
          setUser(result.user);
        }
      }
    } catch (error) {
      console.error('检查认证状态失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setUser(null);
        // 可以添加成功提示
      }
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    setIsLoginModalOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          {/* 左侧Logo */}
          <div className="navbar-brand">
            <span className="brand-text">Halo</span>
            <span className="brand-subtitle">股票分析平台</span>
          </div>

          {/* 中间导航菜单 */}
          <div className="navbar-menu">
            <a href="#" className="nav-link">
              市场
            </a>
            <a href="#" className="nav-link">
              股票
            </a>
            <a href="#" className="nav-link">
              分析
            </a>
            <a href="#" className="nav-link">
              工具
            </a>
          </div>

          {/* 右侧用户区域 */}
          <div className="navbar-auth">
            {isLoading ? (
              <div className="auth-loading">加载中...</div>
            ) : user ? (
              <div className="user-menu">
                <span className="user-name">欢迎, {user.username}</span>
                <Button onClick={handleLogout} className="logout-btn" variant="outline">
                  登出
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsLoginModalOpen(true)} className="login-btn">
                登录
              </Button>
            )}
          </div>
        </div>
      </nav>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}
