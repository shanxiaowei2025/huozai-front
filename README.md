# 监控大屏项目

一个基于 Vue 3 的可视化监控大屏系统。

## 🚀 快速开始

### 开发环境（推荐）

开发时直接使用 Vite 开发服务器，无需 Docker：

**方式一：使用快速启动脚本**
```bash
# 一键启动开发环境（自动检查并安装依赖）
./start-dev.sh
```

**方式二：手动启动**
```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器（支持热重载）
npm run dev

# 3. 访问应用
# 浏览器打开：http://localhost:5173
```

**开发环境特性：**
- ⚡️ 快速启动，秒级热重载
- 🔥 代码修改实时生效
- 🐛 方便调试和开发

### 生产环境（Docker 部署）

生产环境使用 Docker 部署，确保环境一致性：

**方式一：使用快速启动脚本**
```bash
# 一键启动生产环境（自动检查 Docker 并启动）
./start-prod.sh
```

**方式二：手动启动**
```bash
# 1. 构建并启动容器
docker-compose up -d

# 2. 查看运行状态
docker-compose ps

# 3. 查看日志
docker-compose logs -f

# 4. 停止服务
docker-compose down

# 5. 访问应用
# 浏览器打开：http://localhost:3000
```

**生产环境特性：**
- 🚀 优化的构建产物
- 🔒 Nginx 静态文件服务
- 📊 资源限制和日志管理
- 🔄 自动重启策略

### 其他命令

```bash
# 本地构建生产版本（测试用）
npm run build

# 预览生产构建
npm run preview
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
├── docker-compose.yml       # Docker 生产环境配置
├── Dockerfile.dev           # 开发环境 Dockerfile（备用）
├── Dockerfile.prod          # 生产环境 Dockerfile
├── start-dev.sh             # 开发环境快速启动脚本
├── start-prod.sh            # 生产环境快速启动脚本
└── DOCKER_DEPLOY.md         # Docker 部署详细文档
```

## 🔧 环境对比

| 特性 | 开发环境 | 生产环境 |
|------|---------|---------|
| 启动方式 | `npm run dev` | `docker-compose up -d` |
| 端口 | 5173 | 3000 |
| 热重载 | ✅ 支持 | ❌ 不支持 |
| 容器化 | ❌ 不使用 | ✅ Docker |
| 构建优化 | ❌ 开发模式 | ✅ 生产优化 |
| 适用场景 | 本地开发调试 | 服务器部署 |

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

1. **开发环境**：直接使用 `npm run dev`，无需 Docker
2. **生产环境**：使用 `docker-compose up -d` 部署
3. 开发环境端口 5173，生产环境端口 3000
4. 确保端口未被占用
5. 首次运行需要先执行 `npm install` 安装依赖

## 📄 许可证

MIT
