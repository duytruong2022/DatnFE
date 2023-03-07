# vue3-template

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Required to run Husky
```
yarn husky install
```
### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

# Running the frontend by docker

Pull `dhtmlx-gantt` project
```
cd pmf-3dwebviewer-web-app
git clone git@gitlab.com:ttlab-pmf/pmf-dhtmlx.git
```

Copy `gantt_7.1.12_commercial` folder into `pmf-3dwebviewer-web-app` project
```
cp -r ./pmf-dhtmlx/gantt_7.1.12_commercial ./gantt_7.1.12_commercial && rm -Rf pmf-dhtmlx
```

Config .env file
```
cp .env.example .env
```

Example .env file
```
VUE_APP_API_URL=http://127.0.0.1:3000/api/v1

VUE_APP_WEBVIEWER3D_URL=https://3dwebviewer.skyeduca.com

VUE_APP_API_THUMBNAIL_URL=http://127.0.0.1:3000/thumbnail

VUE_APP_API_DOWNLOAD_ABS_FILE_URL=http://127.0.0.1:3000/download

VUE_APP_SOCKET_SERVER_URL=http://127.0.0.1:3000
```

Build docker image `pmf-frontend`
```
docker build -t pmf-frontend .
```

Running the `pmf-frontend` container
```
docker run -d --name pmf-frontend -p 8080:80 pmf-frontend
```

Check status of the container
```
$ docker ps

CONTAINER ID   IMAGE               COMMAND                  CREATED             STATUS             PORTS                                           NAMES
30b56c9756b9   pmf-frontend       "nginx -g 'daemon of…"   2 minutes ago       Up 2 minutes       0.0.0.0:8080->80/tcp, :::8080->80/tcp           pmf-frontend
```
