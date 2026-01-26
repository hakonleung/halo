# API 规格文档

> PRD_001 | 可视化模块

## 概览

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/dashboard/stats` | GET | 概览统计数据 |
| `/api/dashboard/trends` | GET | 趋势数据 |
| `/api/dashboard/heatmap` | GET | 热力图数据 |

---

## GET /api/dashboard/stats

获取 Dashboard 概览统计数据。

### 请求

```http
GET /api/dashboard/stats
Authorization: Bearer <token>
```

无请求参数。

### 响应

**成功 (200)**:
```json
{
  "data": {
    "today": {
      "total": 12,
      "byType": [
        { "definitionId": "uuid-1", "name": "阅读", "count": 3 },
        { "definitionId": "uuid-2", "name": "运动", "count": 5 },
        { "definitionId": "uuid-3", "name": "冥想", "count": 4 }
      ]
    },
    "streak": {
      "current": 7,
      "longest": 21
    },
    "goalRate": {
      "overall": 68,
      "change": 5
    },
    "weekCompare": {
      "thisWeek": 42,
      "lastWeek": 36,
      "change": 16.67
    }
  }
}
```

**未授权 (401)**:
```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required"
}
```

---

## GET /api/dashboard/trends

获取行为趋势数据。

### 请求

```http
GET /api/dashboard/trends?range=7d&types=uuid-1,uuid-2
Authorization: Bearer <token>
```

| 参数 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| range | string | 否 | '7d' | 'today' \| '7d' \| '30d' \| '90d' \| 'custom' |
| start | string | 条件 | - | range=custom 时必填，ISO 日期 |
| end | string | 条件 | - | range=custom 时必填，ISO 日期 |
| types | string | 否 | - | 行为类型 ID，逗号分隔 |

### 响应

**成功 (200)**:
```json
{
  "data": {
    "points": [
      {
        "date": "2026-01-19",
        "total": 8,
        "byType": {
          "uuid-1": 3,
          "uuid-2": 5
        }
      },
      {
        "date": "2026-01-20",
        "total": 6,
        "byType": {
          "uuid-1": 2,
          "uuid-2": 4
        }
      }
    ],
    "types": [
      { "id": "uuid-1", "name": "阅读", "color": "#00FF41" },
      { "id": "uuid-2", "name": "运动", "color": "#00D4FF" }
    ]
  }
}
```

**参数错误 (400)**:
```json
{
  "error": "INVALID_DATE_RANGE",
  "message": "Start date must be before end date"
}
```

---

## GET /api/dashboard/heatmap

获取活跃度热力图数据。

### 请求

```http
GET /api/dashboard/heatmap?months=12
Authorization: Bearer <token>
```

| 参数 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| months | number | 否 | 12 | 获取最近 N 个月的数据 |

### 响应

**成功 (200)**:
```json
{
  "data": [
    { "date": "2026-01-01", "count": 0, "level": 0 },
    { "date": "2026-01-02", "count": 2, "level": 1 },
    { "date": "2026-01-03", "count": 5, "level": 2 },
    { "date": "2026-01-04", "count": 8, "level": 3 },
    { "date": "2026-01-05", "count": 12, "level": 4 }
  ]
}
```

### Level 计算规则

| Level | 记录数 | 颜色 |
|-------|--------|------|
| 0 | 0 | #1a1a1a |
| 1 | 1-2 | rgba(0,255,65,0.2) |
| 2 | 3-5 | rgba(0,255,65,0.4) |
| 3 | 6-9 | rgba(0,255,65,0.6) |
| 4 | 10+ | rgba(0,255,65,0.9) |

---

## 通用错误码

| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| 400 | INVALID_PARAMS | 参数格式错误 |
| 400 | INVALID_DATE_RANGE | 日期范围无效 |
| 401 | UNAUTHORIZED | 未登录或 token 过期 |
| 500 | INTERNAL_ERROR | 服务器内部错误 |

---

## 数据格式约定

- 日期格式: ISO 8601 (`YYYY-MM-DD` 或 `YYYY-MM-DDTHH:mm:ssZ`)
- 百分比: 整数 (0-100)
- ID: UUID v4
