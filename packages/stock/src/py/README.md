# 股票数据API模块

这个目录包含了从原始 `stock_data.py` 拆分出来的模块化股票数据API。

## 文件结构

```
py/
├── __init__.py           # 包初始化文件，导出所有API
├── base.py              # 基础类和工具函数
├── all_stocks.py        # 所有股票信息API
├── stock_history.py     # 股票历史数据API
├── stock_realtime.py    # 股票实时数据API
├── stock_basic_info.py  # 股票基本信息API
└── README.md           # 本文档
```

## 模块说明

### base.py

- `BaseStockAPI`: 基础API类，提供统一的错误处理和响应格式
- `to_json_string()`: 将数据转换为JSON字符串的工具函数

### all_stocks.py

- `AllStocksAPI`: 获取所有A股股票基本信息
- `get_all_stocks_info()`: 便捷函数，返回JSON字符串

### stock_history.py

- `StockHistoryAPI`: 获取股票历史K线数据
- `get_stock_history()`: 便捷函数，支持按日期区间查询

### stock_realtime.py

- `StockRealtimeAPI`: 获取股票实时数据
- `get_stock_realtime()`: 便捷函数，获取单只股票实时行情

### stock_basic_info.py

- `StockBasicInfoAPI`: 获取股票详细基本信息
- `get_stock_individual_basic_info_xq()`: 便捷函数，获取个股基本面数据

## 使用方式

### 1. 使用单独的模块

```python
from py.all_stocks import get_all_stocks_info
from py.stock_history import get_stock_history
from py.stock_realtime import get_stock_realtime
from py.stock_basic_info import get_stock_individual_basic_info_xq

# 获取所有股票信息
all_stocks = get_all_stocks_info()

# 获取股票历史数据
history = get_stock_history("000001", "2024-01-01", "2024-01-31")

# 获取实时数据
realtime = get_stock_realtime("000001")

# 获取基本信息
basic_info = get_stock_individual_basic_info_xq("000001")
```

### 2. 使用统一的API类（向后兼容）

```python
from py import StockDataAPI

api = StockDataAPI()
all_stocks = api.get_all_stocks_info()
history = api.get_stock_history("000001", "2024-01-01", "2024-01-31")
realtime = api.get_stock_realtime("000001")
basic_info = api.get_stock_individual_basic_info_xq("000001")
```

### 3. 使用API类

```python
from py import AllStocksAPI, StockHistoryAPI, StockRealtimeAPI, StockBasicInfoAPI

all_stocks_api = AllStocksAPI()
history_api = StockHistoryAPI()
realtime_api = StockRealtimeAPI()
basic_info_api = StockBasicInfoAPI()

# 获取数据（返回字典格式）
all_stocks = all_stocks_api.get_all_stocks_info()
history = history_api.get_stock_history("000001")
```

## 优势

1. **模块化**: 每个功能独立为单独的文件，便于维护和扩展
2. **可重用**: 可以单独导入和使用某个API，而不需要加载所有功能
3. **统一接口**: 所有API都继承自`BaseStockAPI`，提供一致的错误处理和响应格式
4. **向后兼容**: 提供了`StockDataAPI`类保持与原始接口的兼容性
5. **易于测试**: 每个模块都可以独立测试
6. **清晰结构**: 代码组织更加清晰，便于理解和维护

## 依赖

- akshare: A股数据获取库
- pandas: 数据处理库
- typing: 类型注解支持
