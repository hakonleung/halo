from .base import BaseStockAPI, to_json_string
import akshare as ak
from typing import Dict, Any


class StockBasicInfoAPI(BaseStockAPI):
    """股票基本信息API类"""

    def get_stock_individual_basic_info_xq(self, symbol: str) -> Dict[str, Any]:
        """
        获取个股基本信息（东方财富数据源）
        注意：原计划使用雪球API，但由于akshare雪球API存在问题，实际使用东方财富API

        Args:
            symbol (str): 股票代码，如 "000001"

        Returns:
            Dict[str, Any]: 个股基本信息
        """
        try:
            # 确保股票代码格式正确
            if not symbol:
                raise ValueError("股票代码不能为空")

            # 获取股票基本信息（使用东方财富API）
            stock_info = ak.stock_individual_info_em(symbol=symbol)

            # 转换为字典格式
            basic_info = {}
            for _, row in stock_info.iterrows():
                key = row.get("item", "")
                value = row.get("value", "")
                if key and value:
                    basic_info[key] = value

            # 构建返回数据
            result_data = {
                "code": symbol,
                "name": basic_info.get("股票简称", ""),
                "industry": basic_info.get("行业", ""),
                "list_date": basic_info.get("上市时间", ""),
                "total_shares": basic_info.get("总股本", ""),
                "circulating_shares": basic_info.get("流通股", ""),
            }

            return self._success_response(
                data=result_data,
                symbol=symbol
            )
        except Exception as e:
            return self._handle_error(e, symbol=symbol)


# 创建全局实例
stock_basic_info_api = StockBasicInfoAPI()


def get_stock_individual_basic_info_xq(symbol: str) -> str:
    """获取个股基本信息的JSON字符串"""
    result = stock_basic_info_api.get_stock_individual_basic_info_xq(symbol)
    return to_json_string(result)


if __name__ == "__main__":
    # 测试代码
    print("测试获取个股基本信息...")
    print(get_stock_individual_basic_info_xq("000001"))
