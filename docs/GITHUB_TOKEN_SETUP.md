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

#### 方法1: Shell 配置文件（推荐）

```bash
# 添加到 ~/.zshrc 或 ~/.bashrc
echo 'export GITHUB_TOKEN="your_token_here"' >> ~/.zshrc
source ~/.zshrc
```

#### 方法2: 使用项目脚本

```bash
# 使用项目提供的脚本
source ./scripts/setup-env.sh your_token_here
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