# build stage
FROM node:alpine as build-stage
WORKDIR /app

ENV BASE_URL="/admin"

COPY ./package.json ./
RUN npm cache clean --force && npm install 
COPY ./ ./
RUN npm run build

# production stage
FROM nginx as production-stage
EXPOSE 3001

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]