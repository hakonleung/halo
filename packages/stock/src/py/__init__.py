# 股票数据API包
# 拆分后的模块化API接口

from .all_stocks import AllStocksAPI, get_all_stocks_info
from .stock_history import StockHistoryAPI, get_stock_history
from .stock_realtime import StockRealtimeAPI, get_stock_realtime
from .stock_basic_info import StockBasicInfoAPI, get_stock_individual_basic_info_xq
from .base import BaseStockAPI, to_json_string

# 导出所有API类
__all__ = [
    # API类
    'BaseStockAPI',
    'AllStocksAPI',
    'StockHistoryAPI',
    'StockRealtimeAPI',
    'StockBasicInfoAPI',

    # 便捷函数
    'get_all_stocks_info',
    'get_stock_history',
    'get_stock_realtime',
    'get_stock_individual_basic_info_xq',
    'to_json_string'
]

# 版本信息
__version__ = '1.0.0'
__author__ = 'Stock Data API Team'
__description__ = '模块化的A股数据查询API'

# 创建统一的API实例（向后兼容）


class StockDataAPI:
    """统一的股票数据API类，向后兼容原始接口"""

    def __init__(self):
        self.all_stocks = AllStocksAPI()
        self.history = StockHistoryAPI()
        self.realtime = StockRealtimeAPI()
        self.basic_info = StockBasicInfoAPI()

    def get_all_stocks_info(self):
        """获取所有股票信息"""
        return self.all_stocks.get_all_stocks_info()

    def get_stock_history(self, symbol, start_date=None, end_date=None):
        """获取股票历史数据"""
        return self.history.get_stock_history(symbol, start_date, end_date)

    def get_stock_realtime(self, symbol):
        """获取股票实时数据"""
        return self.realtime.get_stock_realtime(symbol)

    def get_stock_individual_basic_info_xq(self, symbol):
        """获取股票基本信息"""
        return self.basic_info.get_stock_individual_basic_info_xq(symbol)


# 向后兼容的全局实例
stock_api = StockDataAPI()
