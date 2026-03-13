# frontend/Dockerfile

# 1. Этап сборки React-приложения
FROM node:22-alpine AS build

WORKDIR /app

# Устанавливаем зависимости
COPY package.json package-lock.json ./
RUN npm ci

# Копируем исходники и собираем
COPY . .
RUN npm run build

# 2. Этап nginx для отдачи статики
FROM nginx:1.27-alpine

# Удаляем дефолтный конфиг и добавляем свой
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем собранный билд
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
