FROM node:18 AS builder
WORKDIR /app
COPY ./frontend .

RUN npm install
RUN npm run build


FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html

COPY ./frontend/public/env.js.template /usr/share/nginx/html/env.js

COPY ./frontend/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]