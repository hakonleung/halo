# 05 - 数据获取机制

> 🟡 中级 | 深入 fetch 扩展、Server Actions 和数据流

## 目录

- [fetch 扩展](#fetch-扩展)
- [服务端数据获取](#服务端数据获取)
- [客户端数据获取](#客户端数据获取)
- [Server Actions](#server-actions)
- [并行数据获取](#并行数据获取)

## fetch 扩展

Next.js 扩展了原生 `fetch()` API,添加缓存和重新验证功能。

### 扩展选项

```typescript
// Next.js 扩展的 fetch
fetch(url, {
  // 原生选项
  method: 'GET',
  headers: {},
  body: '',

  // Next.js 扩展
  next: {
    revalidate: 60,        // 重新验证时间 (秒)
    tags: ['posts']        // 缓存标签
  },

  // 缓存控制
  cache: 'force-cache' | 'no-store'
})
```

### 源码实现

**位置**: `packages/next/src/server/lib/patch-fetch.ts`

```typescript
// 简化的 fetch 扩展
export function patchFetch(options: PatchFetchOptions) {
  const originalFetch = global.fetch

  global.fetch = async function nextFetch(
    input: RequestInfo,
    init?: RequestInit & { next?: NextFetchOptions }
  ): Promise<Response> {
    const url = typeof input === 'string' ? input : input.url

    // 1. 提取 Next.js 选项
    const { next, cache, ...fetchOptions } = init || {}
    const { revalidate, tags } = next || {}

    // 2. 计算缓存键
    const cacheKey = generateCacheKey(url, fetchOptions)

    // 3. 检查缓存
    if (cache !== 'no-store') {
      const cached = await incrementalCache.get(cacheKey)

      if (cached && !isCacheExpired(cached, revalidate)) {
        return new Response(cached.data, cached.responseInit)
      }
    }

    // 4. 发起请求
    const response = await originalFetch(input, fetchOptions)

    // 5. 存储缓存
    if (cache !== 'no-store') {
      const data = await response.clone().arrayBuffer()

      await incrementalCache.set(cacheKey, {
        data,
        responseInit: {
          status: response.status,
          headers: response.headers
        },
        tags,
        revalidate
      })
    }

    return response
  }
}
```

## 服务端数据获取

### Server Components

```tsx
// app/posts/page.tsx
export default async function Posts() {
  // ✅ 直接在组件中 await
  const posts = await fetch('https://api.example.com/posts')
    .then(res => res.json())

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

### 数据库查询

```tsx
// app/users/page.tsx
import { db } from '@/lib/db'

export default async function Users() {
  // ✅ 直接访问数据库
  const users = await db.user.findMany()

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

### 并行获取

```tsx
// app/dashboard/page.tsx
export default async function Dashboard() {
  // ✅ 并行获取多个数据源
  const [user, posts, analytics] = await Promise.all([
    fetch('/api/user').then(r => r.json()),
    fetch('/api/posts').then(r => r.json()),
    fetch('/api/analytics').then(r => r.json())
  ])

  return (
    <div>
      <UserInfo user={user} />
      <Posts posts={posts} />
      <Analytics data={analytics} />
    </div>
  )
}
```

## 客户端数据获取

### useEffect + fetch

```tsx
'use client'

import { useState, useEffect } from 'react'

export function Posts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>Loading...</div>

  return <ul>{/* ... */}</ul>
}
```

### SWR / React Query

```tsx
'use client'

import useSWR from 'swr'

export function Posts() {
  const { data, error, isLoading } = useSWR(
    '/api/posts',
    fetcher
  )

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error</div>

  return <ul>{/* ... */}</ul>
}
```

## Server Actions

### 定义

```typescript
// app/actions.ts
'use server'

import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const title = formData.get('title')
  const content = formData.get('content')

  // 验证
  if (!title || !content) {
    return { error: 'Missing fields' }
  }

  // 数据库操作
  await db.post.create({ data: { title, content } })

  // 重新验证
  revalidatePath('/posts')

  return { success: true }
}
```

### 使用

```tsx
// app/new-post/page.tsx
import { createPost } from './actions'

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" />
      <textarea name="content" />
      <button>Create</button>
    </form>
  )
}
```

## 并行数据获取

### 顺序 vs 并行

```tsx
// ❌ 顺序获取 (慢)
async function Page() {
  const user = await fetch('/api/user')      // 100ms
  const posts = await fetch('/api/posts')    // 100ms
  // 总时间: 200ms
}

// ✅ 并行获取 (快)
async function Page() {
  const [user, posts] = await Promise.all([
    fetch('/api/user'),     // 100ms
    fetch('/api/posts')     // 100ms
  ])
  // 总时间: 100ms
}
```

---

**Sources:**
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
