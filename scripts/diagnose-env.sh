#!/bin/bash

echo "🔍 GitHub Token 环境诊断工具"
echo "================================"

echo ""
echo "📋 基本环境信息:"
echo "  当前Shell: $SHELL"
echo "  当前用户: $(whoami)"
echo "  当前目录: $(pwd)"

echo ""
echo "🔍 Shell版本检测:"
if [ -n "$ZSH_VERSION" ]; then
    echo "  ✅ ZSH版本: $ZSH_VERSION"
elif [ -n "$BASH_VERSION" ]; then
    echo "  ✅ BASH版本: $BASH_VERSION"
else
    echo "  ❓ 未检测到已知shell版本"
fi

echo ""
echo "📁 配置文件检查:"
config_files=(
    "$HOME/.zshrc"
    "$HOME/.zprofile" 
    "$HOME/.bashrc"
    "$HOME/.bash_profile"
    "$HOME/.profile"
)

for config_file in "${config_files[@]}"; do
    if [ -f "$config_file" ]; then
        if grep -q "GITHUB_TOKEN" "$config_file"; then
            echo "  ✅ $config_file - 包含GITHUB_TOKEN配置"
            grep -n "GITHUB_TOKEN" "$config_file" | sed 's/^/     /'
        else
            echo "  📄 $config_file - 存在但无GITHUB_TOKEN配置"
        fi
    else
        echo "  ❌ $config_file - 不存在"
    fi
done

echo ""
echo "🔐 当前会话Token状态:"
if [ -n "$GITHUB_TOKEN" ]; then
    echo "  ✅ GITHUB_TOKEN已设置"
    echo "     长度: ${#GITHUB_TOKEN} 字符"
    echo "     前缀: ${GITHUB_TOKEN:0:8}..."
    
    # 测试API访问
    if command -v curl >/dev/null 2>&1; then
        echo "  🧪 测试API访问..."
        response=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user)
        if [ "$response" = "200" ]; then
            echo "     ✅ API访问正常"
        else
            echo "     ❌ API访问失败 (HTTP $response)"
        fi
    fi
else
    echo "  ❌ GITHUB_TOKEN未设置"
fi

echo ""
echo "🧪 新会话测试:"
echo "  ZSH新会话:"
zsh_token_length=$(zsh -c 'echo ${#GITHUB_TOKEN}' 2>/dev/null)
if [ "$zsh_token_length" -gt 0 ]; then
    echo "    ✅ ZSH会话中Token可用 (长度: $zsh_token_length)"
else
    echo "    ❌ ZSH会话中Token不可用"
fi

echo "  BASH新会话:"
bash_token_length=$(bash -c 'echo ${#GITHUB_TOKEN}' 2>/dev/null)
if [ "$bash_token_length" -gt 0 ]; then
    echo "    ✅ BASH会话中Token可用 (长度: $bash_token_length)"
else
    echo "    ❌ BASH会话中Token不可用"
fi

echo ""
echo "🚀 建议解决方案:"

if [ -z "$GITHUB_TOKEN" ]; then
    echo "  1. 设置GitHub Token:"
    echo "     source ./scripts/setup-env.sh your_token_here"
elif [ "$zsh_token_length" -eq 0 ] && [ "$SHELL" = "/bin/zsh" ]; then
    echo "  1. ZSH用户但token未在ZSH中加载，运行:"
    echo "     source ./scripts/setup-env.sh $GITHUB_TOKEN"
elif [ "$bash_token_length" -eq 0 ] && [[ "$SHELL" == *"bash"* ]]; then
    echo "  1. BASH用户但token未在BASH中加载，运行:"
    echo "     source ./scripts/setup-env.sh $GITHUB_TOKEN"
else
    echo "  ✅ 环境配置正常，可以直接使用发布命令:"
    echo "     pnpm release:patch"
fi

echo ""
echo "📚 其他有用命令:"
echo "  重新加载配置: source ~/.zshrc (或 source ~/.bashrc)"
echo "  检查环境状态: bash scripts/check-env.sh"
echo "  重新设置Token: source ./scripts/setup-env.sh new_token" 