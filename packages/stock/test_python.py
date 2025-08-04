#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
A股数据API Python测试脚本
"""

import sys
import os
import json
from datetime import datetime

# 添加src目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

try:
    from stock_data import stock_api, get_all_stocks_info, get_stock_history, get_stock_realtime
except ImportError as e:
    print(f"导入模块失败: {e}")
    print("请确保已安装所有Python依赖: pip install -r requirements.txt")
    sys.exit(1)


def test_stock_api():
    """测试股票API功能"""
    print("开始测试A股数据API...\n")

    try:
        # 测试1: 获取所有股票信息
        print("1. 测试获取所有股票信息...")
        result = stock_api.get_all_stocks_info()
        print(f"成功: {result['success']}")
        if result['success']:
            print(f"股票总数: {result.get('total', 0)}")
            if result.get('data'):
                print(
                    f"示例股票: {result['data'][0] if result['data'] else '无数据'}")
        else:
            print(f"错误: {result.get('error', '未知错误')}")
        print()

        # 测试2: 获取股票历史数据（所有历史）
        print("2. 测试获取股票历史数据（所有历史）...")
        history_result = stock_api.get_stock_history('000001')
        print(f"成功: {history_result['success']}")
        if history_result['success']:
            print(f"数据条数: {history_result.get('total', 0)}")
            if history_result.get('data'):
                print(
                    f"示例数据: {history_result['data'][0] if history_result['data'] else '无数据'}")
        else:
            print(f"错误: {history_result.get('error', '未知错误')}")
        print()

        # 测试3: 获取股票历史数据（指定时间范围）
        print("3. 测试获取股票历史数据（指定时间范围）...")
        range_history = stock_api.get_stock_history(
            '000001', '2024-01-01', '2024-01-31')
        print(f"成功: {range_history['success']}")
        if range_history['success']:
            print(f"数据条数: {range_history.get('total', 0)}")
            print(
                f"时间范围: {range_history.get('start_date')} 到 {range_history.get('end_date')}")
        else:
            print(f"错误: {range_history.get('error', '未知错误')}")
        print()

        # 测试4: 获取股票实时数据
        print("4. 测试获取股票实时数据...")
        realtime_result = stock_api.get_stock_realtime('000001')
        print(f"成功: {realtime_result['success']}")
        if realtime_result['success']:
            data = realtime_result.get('data', {})
            print(f"股票代码: {data.get('code', 'N/A')}")
            print(f"股票名称: {data.get('name', 'N/A')}")
            print(f"当前价格: {data.get('current_price', 'N/A')}")
            print(f"涨跌幅: {data.get('change', 'N/A')}%")
        else:
            print(f"错误: {realtime_result.get('error', '未知错误')}")
        print()

        # 测试5: 测试JSON字符串函数
        print("5. 测试JSON字符串函数...")
        json_all_stocks = get_all_stocks_info()
        print(f"所有股票JSON长度: {len(json_all_stocks)}")

        json_history = get_stock_history('000001', '2024-01-01', '2024-01-31')
        print(f"历史数据JSON长度: {len(json_history)}")

        json_realtime = get_stock_realtime('000001')
        print(f"实时数据JSON长度: {len(json_realtime)}")
        print()

        print("所有测试完成！")

    except Exception as e:
        print(f"测试过程中发生错误: {e}")
        import traceback
        traceback.print_exc()


def test_error_handling():
    """测试错误处理"""
    print("\n测试错误处理...")

    # 测试无效股票代码
    print("1. 测试无效股票代码...")
    result = stock_api.get_stock_history('INVALID_CODE')
    print(f"结果: {result['success']}")
    if not result['success']:
        print(f"错误信息: {result.get('error', 'N/A')}")

    # 测试无效日期格式
    print("\n2. 测试无效日期格式...")
    result = stock_api.get_stock_history(
        '000001', 'invalid-date', 'invalid-date')
    print(f"结果: {result['success']}")
    if not result['success']:
        print(f"错误信息: {result.get('error', 'N/A')}")


if __name__ == "__main__":
    print("=" * 50)
    print("A股数据API Python测试")
    print("=" * 50)
    print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Python版本: {sys.version}")
    print("=" * 50)

    # 运行主要测试
    test_stock_api()

    # 运行错误处理测试
    test_error_handling()

    print("\n" + "=" * 50)
    print("测试完成")
    print("=" * 50)
