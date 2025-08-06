'use client';

import type { User } from '@halo/models';
import { useCallback, useState } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  user?: User;
  accessToken?: string;
  error?: string;
}

interface RegisterResponse {
  success: boolean;
  message?: string;
  user?: User;
  error?: string;
}

export function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');

      try {
        if (isLoginMode) {
          // 登录逻辑
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              username: formData.username,
              password: formData.password,
            }),
          });

          const result: LoginResponse = await response.json();

          if (result.success && result.user) {
            onLoginSuccess(result.user);
            setFormData({ username: '', password: '', confirmPassword: '' });
          } else {
            setError(result.error || '登录失败');
          }
        } else {
          // 注册逻辑
          if (formData.password !== formData.confirmPassword) {
            setError('两次输入的密码不匹配');
            return;
          }

          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: formData.username,
              password: formData.password,
            }),
          });

          const result: RegisterResponse = await response.json();

          if (result.success && result.user) {
            // 注册成功后自动登录
            const loginResponse = await fetch('/api/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                username: formData.username,
                password: formData.password,
              }),
            });

            const loginResult: LoginResponse = await loginResponse.json();
            if (loginResult.success && loginResult.user) {
              onLoginSuccess(loginResult.user);
              setFormData({ username: '', password: '', confirmPassword: '' });
            }
          } else {
            setError(result.error || '注册失败');
          }
        }
      } catch {
        setError('网络错误，请稍后重试');
      } finally {
        setIsLoading(false);
      }
    },
    [formData.confirmPassword, formData.password, formData.username, isLoginMode, onLoginSuccess]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    },
    [formData]
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isLoginMode ? '登录' : '注册'} Halo</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="auth-tabs">
            <button
              className={`tab-button ${isLoginMode ? 'active' : ''}`}
              onClick={() => {
                setIsLoginMode(true);
                setError('');
              }}
            >
              登录
            </button>
            <button
              className={`tab-button ${!isLoginMode ? 'active' : ''}`}
              onClick={() => {
                setIsLoginMode(false);
                setError('');
              }}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">用户名</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="form-input"
                placeholder="请输入用户名"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">密码</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder="请输入密码"
                required
              />
            </div>

            {!isLoginMode && (
              <div className="form-group">
                <label className="form-label">确认密码</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="请再次输入密码"
                  required
                />
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={isLoading} className="submit-button">
              {isLoading ? '处理中...' : isLoginMode ? '登录' : '注册'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
