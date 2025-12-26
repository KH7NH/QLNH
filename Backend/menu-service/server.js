const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
const monanRoutes = require("./src/routes/menuRoutes");




const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/monan", monanRoutes);
//monan la menu

app.listen(5003, () => {
  console.log("Menu Service chạy port 5003");
});
