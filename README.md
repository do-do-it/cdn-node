# cnd-node

基于node和nginx的静态资源服务器

## Project setup
```
yarn install
```

### for development
```
nodemon src/app.js
```

### for production
```
pm2 start src/app.js -n cdn
```