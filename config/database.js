const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
(async () => {
  console.log(process.env.MONGODB_URL)
  await mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => console.log("connected to mongodb"))
    .catch((err) => console.log(err));
})();
