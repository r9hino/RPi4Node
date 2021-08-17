cd Backend
pm2 start server.js
cd ../Frontend
pm2 start "npm run serve" --name vue-client
cd ..