#!/bin/bash

echo "🔍 检查 GitHub Token 配置状态..."

if [ -n "$GITHUB_TOKEN" ]; then
    echo "✅ GITHUB_TOKEN 已设置"
    echo "   Token 长度: ${#GITHUB_TOKEN} 字符"
    echo "   Token 前缀: ${GITHUB_TOKEN:0:8}..."
    
    # 测试 Token 有效性
    echo ""
    echo "🧪 测试 Token 有效性..."
    if command -v curl >/dev/null 2>&1; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user)
        if [ "$response" = "200" ]; then
            echo "✅ Token 有效，可以访问 GitHub API"
        else
            echo "❌ Token 无效或权限不足 (HTTP $response)"
        fi
    else
        echo "⚠️  curl 不可用，跳过 Token 验证"
    fi
else
    echo "❌ GITHUB_TOKEN 未设置"
    echo ""
    echo "设置方法:"
    echo "  export GITHUB_TOKEN=your_github_token_here"
    echo "  或者:"
    echo "  source ./scripts/setup-env.sh your_github_token_here"
fi

echo ""
echo "📝 其他相关命令:"
echo "  检查环境变量: echo \$GITHUB_TOKEN"
echo "  测试发布命令: pnpm changelog"
echo "  完整发布: pnpm release:patch" 