const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
const userRoutes = require('./src/routes/userRoutes');




const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/users", userRoutes);
//user là user

app.listen(5001, () => {
  console.log("User Service chạy port 5001");
});