#!/bin/bash

cd Backend
pm2 start server.js --output ./Logs/info.log --error ./Logs/error.log

cd ../Frontend
pm2 start "npm run serve" --name vue-client --output ../Backend/Logs/vue-client-out.log --error ../Backend/Logs/vue-client-error.log

cd ..