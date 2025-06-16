#!/bin/bash

# GitHub Token 设置脚本
echo "🔐 设置 GitHub Token for releases..."

if [ -z "$1" ]; then
    echo "用法:"
    echo "  source ./scripts/setup-env.sh <your-github-token>"
    echo "  或者直接设置:"
    echo "  export GITHUB_TOKEN=your_github_token_here"
    echo ""
    echo "检查当前状态:"
    echo "  echo \$GITHUB_TOKEN"
    exit 1
fi

echo "设置 GitHub Token..."
export GITHUB_TOKEN=$1
echo "✅ GitHub Token 已设置在当前会话"

# 验证设置
if [ -n "$GITHUB_TOKEN" ]; then
    echo "✅ 验证成功: Token 长度 ${#GITHUB_TOKEN} 字符"
else
    echo "❌ 验证失败: Token 未设置"
fi

echo ""
echo "现在可以运行发布命令:"
echo "  pnpm release:patch" 