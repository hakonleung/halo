from .base import BaseStockAPI, to_json_string
import akshare as ak
from typing import Dict, Any


class AllStocksAPI(BaseStockAPI):
    """所有股票信息API类"""

    def get_all_stocks_info(self) -> Dict[str, Any]:
        """
        查询A股所有股票基本信息

        Returns:
            Dict[str, Any]: 包含所有股票基本信息的字典
        """
        try:
            # 获取A股所有股票信息
            stock_info_df = ak.stock_info_a_code_name()

            # 转换为字典格式
            stocks_info = []
            for _, row in stock_info_df.iterrows():
                stock_info = {
                    "code": row.get("code", ""),
                    "name": row.get("name", ""),
                    "symbol": row.get("code", ""),
                    "market": "A股"
                }
                stocks_info.append(stock_info)

            return self._success_response(
                data=stocks_info,
                total=len(stocks_info)
            )
        except Exception as e:
            return self._handle_error(e)


# 创建全局实例
all_stocks_api = AllStocksAPI()


def get_all_stocks_info() -> str:
    """获取所有股票信息的JSON字符串"""
    result = all_stocks_api.get_all_stocks_info()
    return to_json_string(result)


if __name__ == "__main__":
    # 测试代码
    print("测试获取所有股票信息...")
    print(get_all_stocks_info())
