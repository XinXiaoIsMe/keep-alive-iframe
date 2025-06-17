# GitHub Token 配置指南

## 一次性配置，永久使用

### 1. 获取 GitHub Token

1. 访问 [GitHub Personal Access Tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 设置权限：
   - `repo` - 完整的仓库访问权限
   - `workflow` - 工作流权限
   - `write:packages` - 包发布权限

### 2. 配置环境变量

#### 方法1: 使用项目脚本（推荐） ⭐

```bash
# 使用改进后的脚本 - 自动永久配置
source ./scripts/setup-env.sh your_token_here
```

**脚本特性：**
- ✅ **自动检测 shell 类型**（zsh/bash）
- ✅ **永久写入配置文件**（~/.zshrc 或 ~/.bashrc）
- ✅ **智能更新现有配置**（避免重复添加）
- ✅ **跨平台兼容**（macOS/Linux）
- ✅ **即时生效**（当前会话立即可用）

#### 方法2: 手动配置

```bash
# 添加到 ~/.zshrc 或 ~/.bashrc
echo 'export GITHUB_TOKEN="your_token_here"' >> ~/.zshrc
source ~/.zshrc
```

### 3. 验证配置

```bash
# 检查环境变量
bash scripts/check-env.sh

# 或者手动检查
echo $GITHUB_TOKEN
```

### 4. 现在可以直接发布

```bash
# 补丁版本
pnpm release:patch

# 小版本
pnpm release:minor

# 大版本  
pnpm release:major
```

## 改进后的脚本使用示例

```bash
# 初次设置
source ./scripts/setup-env.sh ghp_your_github_token_here

# 输出示例:
# 🔐 永久设置 GitHub Token for releases...
# 🔍 检测到 shell: zsh
# 📝 配置文件: /Users/username/.zshrc
# 📝 添加新的 GITHUB_TOKEN 配置...
# ✅ 已添加 GITHUB_TOKEN 到 /Users/username/.zshrc
# ✅ 当前会话中的 GitHub Token 已设置
# ✅ 验证成功: Token 长度 40 字符
# 🔒 Token 前缀: ghp_xxxx...
# 🎉 配置完成！

# 更新现有token
source ./scripts/setup-env.sh ghp_new_token_here

# 输出示例:
# ⚠️  发现已有 GITHUB_TOKEN 配置
# 📝 更新现有配置...
# ✅ 已更新 GITHUB_TOKEN 配置
```

## 安全提示

- ⚠️ 不要将 token 提交到代码仓库
- ⚠️ 定期轮换 token
- ⚠️ 给 token 设置最小必要权限
- ⚠️ 不要在公共场所展示 token

## 故障排除

如果遇到权限问题：

1. 检查 token 权限设置
2. 确认 token 未过期
3. 验证仓库访问权限
4. 运行 `bash scripts/check-env.sh` 诊断

## 脚本工作原理

1. **Shell 检测**：自动识别 zsh/bash/其他shell
2. **配置文件定位**：选择正确的配置文件路径
3. **重复检查**：检测是否已有配置，避免重复添加
4. **智能更新**：使用 sed 命令精确替换现有配置
5. **即时生效**：在当前会话中同时设置环境变量 