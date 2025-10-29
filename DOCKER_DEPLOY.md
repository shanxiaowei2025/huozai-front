# Docker 部署指南

## 📦 部署方式

本项目使用多阶段构建 + Nginx 的方式进行 Docker 部署，具有以下优势：
- 镜像体积小（约 20-30MB）
- 生产级性能
- 静态资源高效缓存
- 支持 Vue Router History 模式

## 🚀 快速开始

### 方法一：使用 Docker 命令

```bash
# 1. 构建镜像
docker build -t monitoring-dashboard:latest .

# 2. 运行容器
docker run -d -p 80:80 --name dashboard monitoring-dashboard:latest

# 3. 访问应用
# 浏览器打开 http://localhost
```

### 方法二：使用 Docker Compose（推荐）

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 📋 常用命令

### 容器管理

```bash
# 查看运行中的容器
docker ps

# 查看容器日志
docker logs dashboard
docker logs -f dashboard  # 实时查看

# 停止容器
docker stop dashboard

# 启动容器
docker start dashboard

# 重启容器
docker restart dashboard

# 删除容器
docker rm dashboard
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

```bash
# 1. 拉取最新代码
git pull

# 2. 停止并删除旧容器
docker-compose down

# 3. 重新构建并启动
docker-compose up -d --build

# 或者使用 Docker 命令
docker stop dashboard
docker rm dashboard
docker rmi monitoring-dashboard:latest
docker build -t monitoring-dashboard:latest .
docker run -d -p 80:80 --name dashboard monitoring-dashboard:latest
```

## 📚 相关文档

- [Docker 官方文档](https://docs.docker.com/)
- [Nginx 官方文档](https://nginx.org/en/docs/)
- [Docker Compose 文档](https://docs.docker.com/compose/)

