# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm install

FROM deps AS development
ENV NODE_ENV=development
COPY . .
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

FROM deps AS build
ENV NODE_ENV=production
COPY . .
RUN npm run build

FROM nginx:1.25-alpine AS runner
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
