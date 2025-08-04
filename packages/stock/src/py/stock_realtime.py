from .base import BaseStockAPI, to_json_string
import akshare as ak
from typing import Dict, Any


class StockRealtimeAPI(BaseStockAPI):
    """股票实时数据API类"""

    def get_stock_realtime(self, symbol: str) -> Dict[str, Any]:
        """
        获取股票实时数据

        Args:
            symbol (str): 股票代码

        Returns:
            Dict[str, Any]: 实时数据
        """
        try:
            # 获取实时数据
            realtime_data = ak.stock_zh_a_spot_em()

            # 查找指定股票
            stock_data = realtime_data[realtime_data['代码'] == symbol]

            if stock_data.empty:
                return self._handle_error(
                    ValueError(f"未找到股票代码: {symbol}"),
                    symbol=symbol
                )

            row = stock_data.iloc[0]
            realtime_info = {
                "code": row.get("代码", ""),
                "name": row.get("名称", ""),
                "current_price": float(row.get("最新价", 0)),
                "change": float(row.get("涨跌幅", 0)),
                "change_amount": float(row.get("涨跌额", 0)),
                "volume": int(row.get("成交量", 0)),
                "amount": float(row.get("成交额", 0)),
                "amplitude": float(row.get("振幅", 0)),
                "high": float(row.get("最高", 0)),
                "low": float(row.get("最低", 0)),
                "open": float(row.get("今开", 0)),
                "prev_close": float(row.get("昨收", 0)),
                "turnover": float(row.get("换手率", 0)),
                "pe": float(row.get("市盈率-动态", 0)),
                "pb": float(row.get("市净率", 0)),
                "market_cap": float(row.get("总市值", 0)),
                "circulating_market_cap": float(row.get("流通市值", 0))
            }

            return self._success_response(data=realtime_info)
        except Exception as e:
            return self._handle_error(e, symbol=symbol)


# 创建全局实例
stock_realtime_api = StockRealtimeAPI()


def get_stock_realtime(symbol: str) -> str:
    """获取股票实时数据的JSON字符串"""
    result = stock_realtime_api.get_stock_realtime(symbol)
    return to_json_string(result)


if __name__ == "__main__":
    # 测试代码
    print("测试获取股票实时数据...")
    print(get_stock_realtime("000001"))
