#!/bin/bash

# GitHub Token 设置脚本
echo "🔐 设置 GitHub Token for releases..."

if [ -z "$1" ]; then
    echo "用法: ./scripts/setup-env.sh <your-github-token>"
    echo "或者手动设置环境变量:"
    echo "export GITHUB_TOKEN=your_github_token_here"
    exit 1
fi

echo "设置 GitHub Token..."
export GITHUB_TOKEN=$1
echo "✅ GitHub Token 已设置"

echo "现在可以运行发布命令:"
echo "pnpm release:patch" 