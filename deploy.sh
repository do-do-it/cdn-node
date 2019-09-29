#!/bin/bash

# 开始部署
echo "start deployment"
# 为了避免冲突，强制更新本地文件
git fetch --all
git reset --hard origin/master
# 重启服务
pm2 reload cdn
echo "done"