# 🚀 Docker 快速启动指南

## 统一启动命令

**所有环境都使用相同的命令：`docker-compose up -d`**

通过 `.env` 文件控制启动开发环境还是生产环境。

---

## 📝 首次使用

### 1️⃣ 创建配置文件

```bash
cp .env.example .env
```

### 2️⃣ 选择环境

编辑 `.env` 文件：

**开发环境（默认）：**
```bash
COMPOSE_FILE=docker-compose.dev.yml
```

**生产环境：**
```bash
COMPOSE_FILE=docker-compose.prod.yml
```

### 3️⃣ 启动服务

```bash
docker-compose up -d
```

### 4️⃣ 访问应用

- **开发环境**：http://localhost:5173 （支持热重载）
- **生产环境**：http://localhost:3000 （Nginx）

---

## 🔄 环境切换

### 方法一：修改 .env 文件（推荐）

```bash
# 1. 编辑 .env 文件，修改 COMPOSE_FILE 的值
vim .env

# 2. 重启服务
docker-compose down
docker-compose up -d
```

### 方法二：命令行指定（临时）

```bash
# 使用开发环境
docker-compose -f docker-compose.dev.yml up -d

# 使用生产环境
docker-compose -f docker-compose.prod.yml up -d
```

### 方法三：环境变量（临时）

```bash
# 使用开发环境
COMPOSE_FILE=docker-compose.dev.yml docker-compose up -d

# 使用生产环境
COMPOSE_FILE=docker-compose.prod.yml docker-compose up -d
```

---

## 📋 常用命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 重新构建并启动
docker-compose up -d --build

# 查看运行状态
docker-compose ps
docker ps
```

---

## 🔍 环境对比

| 项目 | 开发环境 | 生产环境 |
|------|---------|---------|
| 配置文件 | `docker-compose.dev.yml` | `docker-compose.prod.yml` |
| Dockerfile | `Dockerfile.dev` | `Dockerfile.prod` |
| 访问端口 | 5173 | 3000 |
| Web 服务器 | Vite Dev Server | Nginx |
| 热重载 | ✅ 支持 | ❌ 不支持 |
| 源码挂载 | ✅ 挂载 | ❌ 构建到镜像 |
| 镜像大小 | ~600MB | ~30MB |
| 适用场景 | 本地开发调试 | 生产部署 |

---

## 💡 提示

1. **首次启动较慢**：需要下载依赖和构建镜像，请耐心等待
2. **开发环境热重载**：修改 `src` 目录下的代码会自动刷新
3. **端口冲突**：如果端口被占用，请修改对应的 `docker-compose` 文件
4. **环境隔离**：`.env` 文件不会被提交到 Git，每个开发者可以有自己的配置

---

## 🐛 常见问题

### 1. 端口被占用

```bash
# 修改 docker-compose.dev.yml 或 docker-compose.prod.yml
# 将端口映射改为其他端口，例如：
# - "8080:5173"  # 开发环境
# - "8080:80"    # 生产环境
```

### 2. 修改代码不生效（开发环境）

```bash
# 确保 .env 中使用的是开发配置
cat .env | grep COMPOSE_FILE

# 应该显示：
# COMPOSE_FILE=docker-compose.dev.yml

# 检查容器日志
docker-compose logs -f
```

### 3. 镜像构建失败

```bash
# 清理旧容器和镜像
docker-compose down
docker system prune -a

# 重新构建
docker-compose up -d --build
```

---

## 📚 更多信息

详细文档请查看：[DOCKER_DEPLOY.md](./DOCKER_DEPLOY.md)

