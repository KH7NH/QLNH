const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
const orderRoutes = require('./src/routes/orderRoutes');




const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log("REQ", req.method, req.url);
  console.log("BODY", req.body);
  next();
});

app.use("/order", orderRoutes);
// order là order

app.listen(5002, () => {
  console.log("Order Service chạy port 5002");
});
