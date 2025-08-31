# 使用多阶段构建
# 第一阶段：构建应用
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖（包括devDependencies，构建时需要TypeScript等工具）
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 第二阶段：nginx服务器
FROM nginx:alpine

# 复制自定义nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

# 从构建阶段复制构建产物到nginx默认目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露9898端口
EXPOSE 9898

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]