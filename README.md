Du an Quan ly nha hang

Cach chay du an

cd Backend/api-gateway
npm install

cd ../auth-service
npm install

cd ../menu-service
npm install

cd ../order-service
npm install

cd ../user-service
npm install

cd ../../Frontend
npm install

Mỗi service trong Backend/* có file .env riêng.

Ví dụ:

PORT=4000

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=1d

# DATABASE (SQL SERVER)
DB_USER=
DB_PASSWORD=
DB_SERVER=
DB_DATABASE=
DB_PORT=


pm2 start ecosystem.config.js