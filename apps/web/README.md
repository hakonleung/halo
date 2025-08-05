# Web Application

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API 端点

### 数据库同步 API

**端点**: `POST /api/sync-db`

**描述**: 同步股票数据到数据库

**环境变量配置**:
创建 `.env.local` 文件并添加以下配置：

```env
# 数据库连接配置
POSTGRES_URL="postgresql://username:password@localhost:5432/stock_db"

# 示例：如果使用 Docker 中的 PostgreSQL
# POSTGRES_URL="postgresql://postgres:password@localhost:5432/stock_db"
```

**请求示例**:

```bash
# 基本同步（仅同步价格数据）
curl -X POST http://localhost:3000/api/sync-db \
  -H "Content-Type: application/json"

# 带参数的同步
curl -X POST http://localhost:3000/api/sync-db \
  -H "Content-Type: application/json" \
  -d '{
    "batchSize": 5,
    "delayBetweenBatches": 500,
    "syncBasicInfo": true
  }'
```

**请求参数**:

- `batchSize` (可选): 批次大小，默认为 1
- `delayBetweenBatches` (可选): 批次间延迟毫秒数，默认为 200
- `syncBasicInfo` (可选): 是否同步股票基本信息，默认为 false

**响应示例**:

成功响应：

```json
{
  "success": true,
  "data": {
    "success": true,
    "totalStocks": 100,
    "newStocks": 5,
    "updatedPrices": 500,
    "errors": [],
    "duration": 120
  }
}
```

错误响应：

```json
{
  "success": false,
  "error": "数据库连接配置未找到，请设置 POSTGRES_URL 环境变量"
}
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/tutorials) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
