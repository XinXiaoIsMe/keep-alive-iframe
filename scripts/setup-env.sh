#!/bin/bash

# GitHub Token 永久设置脚本
echo "🔐 永久设置 GitHub Token for releases..."

if [ -z "$1" ]; then
    echo "用法:"
    echo "  source ./scripts/setup-env.sh <your-github-token>"
    echo "  或者直接设置:"
    echo "  export GITHUB_TOKEN=your_github_token_here"
    echo ""
    echo "检查当前状态:"
    echo "  echo \$GITHUB_TOKEN"
    echo "  bash scripts/check-env.sh"
    exit 1
fi

# 检测用户的shell类型
detect_shell() {
    if [ -n "$ZSH_VERSION" ]; then
        echo "zsh"
    elif [ -n "$BASH_VERSION" ]; then
        echo "bash"
    else
        # 通过$SHELL环境变量检测
        case "$SHELL" in
            */zsh) echo "zsh" ;;
            */bash) echo "bash" ;;
            *) echo "unknown" ;;
        esac
    fi
}

# 获取对应的配置文件路径
get_config_file() {
    local shell_type=$1
    case "$shell_type" in
        "zsh") echo "$HOME/.zshrc" ;;
        "bash") echo "$HOME/.bashrc" ;;
        *) echo "$HOME/.profile" ;;
    esac
}

GITHUB_TOKEN=$1
SHELL_TYPE=$(detect_shell)
CONFIG_FILE=$(get_config_file "$SHELL_TYPE")

echo "🔍 检测到 shell: $SHELL_TYPE"
echo "📝 配置文件: $CONFIG_FILE"

# 检查配置文件是否存在
if [ ! -f "$CONFIG_FILE" ]; then
    echo "📄 创建配置文件: $CONFIG_FILE"
    touch "$CONFIG_FILE"
fi

# 检查是否已经存在GITHUB_TOKEN配置
if grep -q "export GITHUB_TOKEN=" "$CONFIG_FILE"; then
    echo "⚠️  发现已有 GITHUB_TOKEN 配置"
    echo "📝 更新现有配置..."
    
    # 使用sed替换现有的GITHUB_TOKEN行
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/export GITHUB_TOKEN=.*/export GITHUB_TOKEN=\"$GITHUB_TOKEN\"/" "$CONFIG_FILE"
    else
        # Linux
        sed -i "s/export GITHUB_TOKEN=.*/export GITHUB_TOKEN=\"$GITHUB_TOKEN\"/" "$CONFIG_FILE"
    fi
    echo "✅ 已更新 GITHUB_TOKEN 配置"
else
    echo "📝 添加新的 GITHUB_TOKEN 配置..."
    echo "" >> "$CONFIG_FILE"
    echo "# GitHub Token for releases (added by setup-env.sh)" >> "$CONFIG_FILE"
    echo "export GITHUB_TOKEN=\"$GITHUB_TOKEN\"" >> "$CONFIG_FILE"
    echo "✅ 已添加 GITHUB_TOKEN 到 $CONFIG_FILE"
fi

# 在当前会话中也设置环境变量
export GITHUB_TOKEN=$1
echo "✅ 当前会话中的 GitHub Token 已设置"

# 验证设置
if [ -n "$GITHUB_TOKEN" ]; then
    echo "✅ 验证成功: Token 长度 ${#GITHUB_TOKEN} 字符"
    echo "🔒 Token 前缀: ${GITHUB_TOKEN:0:8}..."
else
    echo "❌ 验证失败: Token 未设置"
fi

echo ""
echo "🎉 配置完成！重新打开终端或执行以下命令生效:"
echo "  source $CONFIG_FILE"
echo ""
echo "📋 验证配置:"
echo "  bash scripts/check-env.sh"
echo ""
echo "🚀 现在可以运行发布命令:"
echo "  pnpm release:patch"
echo "  pnpm release:minor"
echo "  pnpm release:major" 