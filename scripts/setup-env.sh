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

# 检测用户的真实shell类型（优先使用$SHELL而不是当前执行环境）
detect_user_shell() {
    # 优先使用$SHELL环境变量，这是用户的默认shell
    case "$SHELL" in
        */zsh) echo "zsh" ;;
        */bash) echo "bash" ;;
        */fish) echo "fish" ;;
        *) 
            # 如果$SHELL不明确，再检查版本变量
            if [ -n "$ZSH_VERSION" ]; then
                echo "zsh"
            elif [ -n "$BASH_VERSION" ]; then
                echo "bash"
            else
                echo "unknown"
            fi
            ;;
    esac
}

# 获取对应的配置文件路径列表
get_config_files() {
    local shell_type=$1
    case "$shell_type" in
        "zsh") 
            echo "$HOME/.zshrc $HOME/.zprofile"
            ;;
        "bash") 
            echo "$HOME/.bashrc $HOME/.bash_profile $HOME/.profile"
            ;;
        "fish")
            echo "$HOME/.config/fish/config.fish"
            ;;
        *) 
            echo "$HOME/.profile"
            ;;
    esac
}

# 获取主配置文件
get_primary_config_file() {
    local shell_type=$1
    case "$shell_type" in
        "zsh") echo "$HOME/.zshrc" ;;
        "bash") echo "$HOME/.bashrc" ;;
        "fish") echo "$HOME/.config/fish/config.fish" ;;
        *) echo "$HOME/.profile" ;;
    esac
}

GITHUB_TOKEN=$1
SHELL_TYPE=$(detect_user_shell)
PRIMARY_CONFIG=$(get_primary_config_file "$SHELL_TYPE")
ALL_CONFIGS=$(get_config_files "$SHELL_TYPE")

echo "🔍 检测到用户shell: $SHELL_TYPE (来自 \$SHELL: $SHELL)"
echo "📝 主配置文件: $PRIMARY_CONFIG"

# 检查主配置文件是否存在，不存在则创建
if [ ! -f "$PRIMARY_CONFIG" ]; then
    echo "📄 创建配置文件: $PRIMARY_CONFIG"
    mkdir -p "$(dirname "$PRIMARY_CONFIG")"
    touch "$PRIMARY_CONFIG"
fi

# 检查所有可能的配置文件中是否已经存在GITHUB_TOKEN
token_found=false
updated_file=""

for config_file in $ALL_CONFIGS; do
    if [ -f "$config_file" ] && grep -q "export GITHUB_TOKEN=" "$config_file"; then
        echo "⚠️  发现已有 GITHUB_TOKEN 配置在: $config_file"
        echo "📝 更新现有配置..."
        
        # 使用sed替换现有的GITHUB_TOKEN行
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/export GITHUB_TOKEN=.*/export GITHUB_TOKEN=\"$GITHUB_TOKEN\"/" "$config_file"
        else
            # Linux
            sed -i "s/export GITHUB_TOKEN=.*/export GITHUB_TOKEN=\"$GITHUB_TOKEN\"/" "$config_file"
        fi
        echo "✅ 已更新 GITHUB_TOKEN 配置在: $config_file"
        token_found=true
        updated_file="$config_file"
        break
    fi
done

# 如果没有找到现有配置，在主配置文件中添加新配置
if [ "$token_found" = false ]; then
    echo "📝 添加新的 GITHUB_TOKEN 配置到: $PRIMARY_CONFIG"
    echo "" >> "$PRIMARY_CONFIG"
    echo "# GitHub Token for releases (added by setup-env.sh)" >> "$PRIMARY_CONFIG"
    echo "export GITHUB_TOKEN=\"$GITHUB_TOKEN\"" >> "$PRIMARY_CONFIG"
    echo "✅ 已添加 GITHUB_TOKEN 到 $PRIMARY_CONFIG"
    updated_file="$PRIMARY_CONFIG"
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
echo "  source $updated_file"
echo ""
echo "📋 验证配置:"
echo "  bash scripts/check-env.sh"
echo "  # 或在新终端中:"
echo "  echo \$GITHUB_TOKEN"
echo ""
echo "🚀 现在可以运行发布命令:"
echo "  pnpm release:patch"
echo "  pnpm release:minor"
echo "  pnpm release:major" 