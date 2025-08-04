from .base import BaseStockAPI, to_json_string
import akshare as ak
from typing import Optional, Dict, Any


class StockHistoryAPI(BaseStockAPI):
    """股票历史数据API类"""

    def get_stock_history(self,
                          symbol: str,
                          start_date: Optional[str] = None,
                          end_date: Optional[str] = None) -> Dict[str, Any]:
        """
        查询某只股票历史日K线数据

        Args:
            symbol (str): 股票代码，如 "000001"
            start_date (Optional[str]): 开始日期，格式 "YYYY-MM-DD"，默认为None（查询所有历史）
            end_date (Optional[str]): 结束日期，格式 "YYYY-MM-DD"，默认为None（查询到最新）

        Returns:
            Dict[str, Any]: 包含历史K线数据的字典
        """
        try:
            # 确保股票代码格式正确
            if not symbol:
                raise ValueError("股票代码不能为空")

            # 获取股票历史数据
            if start_date and end_date:
                # 按区间查询
                stock_data_df = ak.stock_zh_a_hist(symbol=symbol,
                                                   period="daily",
                                                   start_date=start_date,
                                                   end_date=end_date,
                                                   adjust="qfq")
            else:
                # 查询所有历史数据
                stock_data_df = ak.stock_zh_a_hist(symbol=symbol, adjust="qfq")

            # 转换为字典格式
            kline_data = []
            for _, row in stock_data_df.iterrows():
                kline = {
                    "date": row.get("日期", ""),
                    "open": float(row.get("开盘", 0)),
                    "high": float(row.get("最高", 0)),
                    "low": float(row.get("最低", 0)),
                    "close": float(row.get("收盘", 0)),
                    "volume": int(row.get("成交量", 0)),
                    "amount": float(row.get("成交额", 0)),
                    "amplitude": float(row.get("振幅", 0)),
                    "pct_change": float(row.get("涨跌幅", 0)),
                    "pct_change_amount": float(row.get("涨跌额", 0)),
                    "turnover": float(row.get("换手率", 0))
                }
                kline_data.append(kline)

            return self._success_response(
                data=kline_data,
                symbol=symbol,
                total=len(kline_data),
                start_date=start_date,
                end_date=end_date
            )
        except Exception as e:
            return self._handle_error(e, symbol=symbol)


# 创建全局实例
stock_history_api = StockHistoryAPI()


def get_stock_history(symbol: str, start_date: str = None, end_date: str = None) -> str:
    """获取股票历史数据的JSON字符串"""
    result = stock_history_api.get_stock_history(symbol, start_date, end_date)
    return to_json_string(result)


if __name__ == "__main__":
    # 测试代码
    print("测试获取股票历史数据...")
    print(get_stock_history("000001", "2024-01-01", "2024-01-31"))
