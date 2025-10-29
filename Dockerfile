# 第一阶段：构建应用
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖（使用 npm ci 确保一致性）
RUN npm ci

# 复制项目文件
COPY . .

# 构建应用
RUN npm run build

# 第二阶段：使用 Nginx 提供服务
FROM nginx:alpine

# 复制构建产物到 nginx 目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 80 端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]

