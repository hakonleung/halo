import akshare as ak
import pandas as pd
from typing import Optional, Dict, List, Any
import json
from datetime import datetime, date


class BaseStockAPI:
    """股票数据API基础类"""

    def __init__(self):
        """初始化API"""
        pass

    def _handle_error(self, error: Exception, symbol: str = None, **kwargs) -> Dict[str, Any]:
        """
        统一的错误处理方法

        Args:
            error: 异常对象
            symbol: 股票代码（可选）
            **kwargs: 其他参数

        Returns:
            Dict[str, Any]: 错误响应字典
        """
        result = {
            "success": False,
            "error": str(error),
            "timestamp": datetime.now().isoformat()
        }

        if symbol:
            result["symbol"] = symbol

        result.update(kwargs)
        return result

    def _success_response(self, data: Any, **kwargs) -> Dict[str, Any]:
        """
        统一的成功响应方法

        Args:
            data: 响应数据
            **kwargs: 其他参数

        Returns:
            Dict[str, Any]: 成功响应字典
        """
        result = {
            "success": True,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }

        result.update(kwargs)
        return result


def to_json_string(data: Dict[str, Any]) -> str:
    """
    将字典数据转换为JSON字符串

    Args:
        data: 要转换的数据字典

    Returns:
        str: JSON字符串
    """
    return json.dumps(data, ensure_ascii=False, default=str)
