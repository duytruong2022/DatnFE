FROM node:14-alpine AS BUILD_IMAGE

# install core libraries
RUN apk update && apk add yarn curl bash make && rm -rf /var/cache/apk/*

WORKDIR /usr/src/app

COPY . .
RUN mv gantt_7.1.12_commercial ../gantt_7.1.12_commercial

RUN yarn install
RUN yarn build

FROM nginx:alpine
COPY nginx/ /etc/nginx/conf.d/

# Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*
COPY --from=BUILD_IMAGE /usr/src/app/dist /usr/share/nginx/html

ENTRYPOINT ["nginx", "-g", "daemon off;"]
