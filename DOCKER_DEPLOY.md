# Docker 部署指南

## 📦 部署方式

本项目支持开发和生产两种 Docker 部署模式：
- **开发模式**：支持热重载，方便本地开发调试
- **生产模式**：多阶段构建 + Nginx，镜像体积小（约 20-30MB），生产级性能

## 🚀 快速开始

### ⚙️ 环境配置（首次使用必读）

**使用统一的 `docker-compose up -d` 命令启动，通过 `.env` 文件切换环境**

```bash
# 1. 复制环境配置文件
cp .env.example .env

# 2. 编辑 .env 文件，选择要启动的环境
# 开发环境：COMPOSE_FILE=docker-compose.dev.yml
# 生产环境：COMPOSE_FILE=docker-compose.prod.yml
```

### 🔧 开发环境启动

```bash
# 1. 确保 .env 文件中设置为开发模式
# COMPOSE_FILE=docker-compose.dev.yml

# 2. 启动服务（统一命令）
docker-compose up -d

# 3. 查看日志
docker-compose logs -f

# 4. 访问应用
# 浏览器打开 http://localhost:5173

# 5. 停止服务
docker-compose down
```

**开发环境特性：**
- ✅ 支持热重载，修改代码自动刷新
- ✅ 源码目录挂载到容器
- ✅ 使用 Vite 开发服务器
- ✅ 端口：5173

### 🚀 生产环境启动

```bash
# 1. 确保 .env 文件中设置为生产模式
# COMPOSE_FILE=docker-compose.prod.yml

# 2. 启动服务（统一命令）
docker-compose up -d

# 3. 查看日志
docker-compose logs -f

# 4. 访问应用
# 浏览器打开 http://localhost:3000

# 5. 停止服务
docker-compose down
```

**生产环境特性：**
- ✅ 多阶段构建，镜像体积小
- ✅ Nginx 静态文件服务
- ✅ 资源限制和日志管理
- ✅ 端口：3000 (映射到容器的 80)

## 🔄 环境切换

### 快速切换开发/生产环境

**方法一：修改 .env 文件（推荐）**

```bash
# 切换到开发环境
# 编辑 .env 文件，设置：
# COMPOSE_FILE=docker-compose.dev.yml

# 切换到生产环境
# 编辑 .env 文件，设置：
# COMPOSE_FILE=docker-compose.prod.yml

# 重启服务使配置生效
docker-compose down
docker-compose up -d
```

**方法二：使用命令行覆盖**

```bash
# 临时使用开发环境（不修改 .env 文件）
docker-compose -f docker-compose.dev.yml up -d

# 临时使用生产环境（不修改 .env 文件）
docker-compose -f docker-compose.prod.yml up -d
```

**方法三：使用环境变量**

```bash
# 临时指定配置文件
COMPOSE_FILE=docker-compose.dev.yml docker-compose up -d
COMPOSE_FILE=docker-compose.prod.yml docker-compose up -d
```

## 📋 常用命令

### 容器管理

```bash
# 查看运行中的容器
docker ps

# 查看容器日志（开发环境）
docker-compose logs -f

# 查看容器日志（生产环境）
docker logs monitoring-dashboard-prod
docker logs -f monitoring-dashboard-prod  # 实时查看

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 重新构建并启动
docker-compose up -d --build
```

### 镜像管理

```bash
# 查看镜像列表
docker images

# 删除镜像
docker rmi monitoring-dashboard:latest

# 清理未使用的镜像
docker image prune -a
```

### 进入容器调试

```bash
# 进入容器 Shell
docker exec -it dashboard sh

# 查看 Nginx 配置
docker exec dashboard cat /etc/nginx/conf.d/default.conf

# 查看网站文件
docker exec dashboard ls -la /usr/share/nginx/html
```

## 🔧 高级配置

### 自定义端口

```bash
# 映射到其他端口（如 8080）
docker run -d -p 8080:80 --name dashboard monitoring-dashboard:latest
```

### 挂载自定义 Nginx 配置

```bash
docker run -d \
  -p 80:80 \
  -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf \
  --name dashboard \
  monitoring-dashboard:latest
```

### 环境变量配置

如果需要在构建时传入环境变量：

```dockerfile
# 在 Dockerfile 的构建阶段添加
ARG API_BASE_URL=https://api.example.com
ENV VITE_API_BASE_URL=$API_BASE_URL
```

构建时传参：
```bash
docker build --build-arg API_BASE_URL=https://api.example.com -t monitoring-dashboard:latest .
```

## 🌐 生产环境部署

### 使用 HTTPS（配合 SSL 证书）

修改 `docker-compose.yml`：

```yaml
services:
  frontend:
    build: .
    container_name: monitoring-dashboard
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl
      - ./nginx-ssl.conf:/etc/nginx/conf.d/default.conf
    restart: unless-stopped
```

### 配合反向代理（Nginx/Traefik）

如果前面已有反向代理服务器，可以不暴露端口，使用内部网络：

```yaml
services:
  frontend:
    build: .
    container_name: monitoring-dashboard
    expose:
      - "80"
    networks:
      - proxy-network
    restart: unless-stopped

networks:
  proxy-network:
    external: true
```

## 📊 性能优化

### 资源限制

```yaml
services:
  frontend:
    build: .
    container_name: monitoring-dashboard
    ports:
      - "80:80"
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
        reservations:
          cpus: '0.25'
          memory: 128M
    restart: unless-stopped
```

### 健康检查

```yaml
services:
  frontend:
    build: .
    container_name: monitoring-dashboard
    ports:
      - "80:80"
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped
```

## 🐛 故障排查

### 容器无法启动

```bash
# 查看容器日志
docker logs dashboard

# 查看详细信息
docker inspect dashboard
```

### 页面无法访问

```bash
# 检查容器是否运行
docker ps

# 检查端口映射
docker port dashboard

# 测试 Nginx 配置
docker exec dashboard nginx -t
```

### 构建失败

```bash
# 清理缓存重新构建
docker build --no-cache -t monitoring-dashboard:latest .
```

## 📝 注意事项

1. **端口占用**：确保 80 端口未被占用，或修改映射端口
2. **防火墙**：确保防火墙允许访问相应端口
3. **资源限制**：生产环境建议配置资源限制和健康检查
4. **日志管理**：建议配置日志轮转，避免日志文件过大

## 🔄 更新部署

### 使用 Docker Compose（推荐）

```bash
# 1. 拉取最新代码
git pull

# 2. 停止并删除旧容器
docker-compose down

# 3. 重新构建并启动（会自动读取 .env 中的配置）
docker-compose up -d --build
```

### 开发环境热重载

开发环境下，由于源码已挂载，大部分代码修改会自动生效，无需重启。
只有以下情况需要重新构建：
- 修改了 `package.json`（新增依赖）
- 修改了 `Dockerfile.dev`
- 修改了 `docker-compose.dev.yml`

```bash
# 重新安装依赖（如果修改了 package.json）
docker-compose exec frontend-dev npm install

# 或者重新构建
docker-compose up -d --build
```

## 📚 相关文档

- [Docker 官方文档](https://docs.docker.com/)
- [Nginx 官方文档](https://nginx.org/en/docs/)
- [Docker Compose 文档](https://docs.docker.com/compose/)

