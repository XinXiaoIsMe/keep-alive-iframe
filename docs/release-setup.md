# 发布设置说明

## 🔐 GitHub Token 配置

为了让 `changelogithub` 能够自动创建 GitHub Release，需要配置 GitHub Token。

### 1. 创建 GitHub Token

1. 访问 GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 点击 "Generate new token (classic)"  
3. 设置 Token 信息：
   - Token name: `keep-alive-iframe-release`
   - Expiration: 选择合适的过期时间
   - Scopes: 勾选 `repo` 和 `write:packages` 权限
4. 点击 "Generate token" 并复制生成的 token

### 2. 配置环境变量

#### 方法 1: 直接设置（推荐）
```bash
# 设置环境变量
export GITHUB_TOKEN=your_github_token_here

# 验证设置
echo $GITHUB_TOKEN

# 运行发布
pnpm release:patch
```

#### 方法 2: 使用 source 命令
```bash
# 使用 source 命令（重要！）
source ./scripts/setup-env.sh your_github_token_here

# 验证设置
pnpm check-env
```

### 3. 验证配置

```bash
# 检查环境变量状态
pnpm check-env

# 或者直接检查
echo $GITHUB_TOKEN
```

## 🚀 发布命令

```bash
# 发布 patch 版本（Bug 修复）
pnpm release:patch

# 发布 minor 版本（新功能）  
pnpm release:minor

# 发布 major 版本（破坏性更改）
pnpm release:major

# 仅生成 changelog
pnpm changelog
```

## 📋 发布流程

1. 版本升级（bumpp）
2. Git 提交和标签
3. 构建库文件  
4. 发布到 npm
5. 生成 GitHub Release

## ⚠️ 注意事项

- 不要将 GitHub Token 提交到代码仓库
- 确保工作区干净（没有未提交的更改）
- 确认 npm 登录状态：`npm whoami` 