# 监控大屏项目

一个基于 Vue 3 的可视化监控大屏系统。

## 🚀 快速开始

### 本地开发（不使用 Docker）

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### Docker 部署（推荐）

**统一启动命令：`docker-compose up -d`**

#### 1. 首次配置

```bash
# 复制环境配置文件
cp .env.example .env

# 编辑 .env 文件，选择环境
# 开发环境：COMPOSE_FILE=docker-compose.dev.yml
# 生产环境：COMPOSE_FILE=docker-compose.prod.yml
```

#### 2. 启动服务

```bash
# 启动（会根据 .env 中的配置自动选择环境）
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

#### 3. 访问应用

- **开发环境**：http://localhost:5173
- **生产环境**：http://localhost:3000

### 环境切换

编辑 `.env` 文件，修改 `COMPOSE_FILE` 的值：

```bash
# 开发环境
COMPOSE_FILE=docker-compose.dev.yml

# 生产环境
COMPOSE_FILE=docker-compose.prod.yml
```

然后重启服务：

```bash
docker-compose down
docker-compose up -d
```

## 📁 项目结构

```
daping/
├── src/
│   ├── components/       # 组件
│   ├── views/           # 页面视图
│   ├── router/          # 路由配置
│   ├── services/        # 服务（API、地图等）
│   ├── App.vue          # 根组件
│   └── main.js          # 入口文件
├── docker-compose.dev.yml   # Docker 开发环境配置
├── docker-compose.prod.yml  # Docker 生产环境配置
├── Dockerfile.dev           # 开发环境 Dockerfile
├── Dockerfile.prod          # 生产环境 Dockerfile
├── .env.example             # 环境变量示例
└── DOCKER_DEPLOY.md         # Docker 部署详细文档
```

## 🔧 开发环境特性

- ✅ 支持热重载（HMR）
- ✅ 源码挂载，修改代码自动刷新
- ✅ Vite 开发服务器
- ✅ 端口：5173

## 🚀 生产环境特性

- ✅ 多阶段构建，镜像体积小
- ✅ Nginx 静态文件服务
- ✅ 资源限制和日志管理
- ✅ 端口：3000

## 📚 相关文档

- [Docker 部署详细文档](./DOCKER_DEPLOY.md)
- [更新日志](./CHANGELOG.md)

## 🛠️ 技术栈

- Vue 3
- Vue Router
- Vite
- Axios
- 百度地图 API
- Docker + Nginx

## 📝 注意事项

1. `.env` 文件不会被提交到 Git（已在 `.gitignore` 中配置）
2. 请根据 `.env.example` 创建自己的 `.env` 文件
3. 开发环境端口 5173，生产环境端口 3000
4. 生产环境需要确保端口未被占用

## 📄 许可证

MIT
