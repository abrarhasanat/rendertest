const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const personRoutes = require("./routes/person-routes");
const centerRoutes = require("./routes/center-routes");
const HttpError = require("./models/http-error");

const app = express();
const port = process.env.PORT || 5000;
app.use(bodyParser.json());
app.use(cors());
app.use("*", cors());
//app.use("/api/places", placesRoutes); // => /api/places...
//app.use("/api/users", usersRoutes);
//app.use("/api/person", personRoutes);
//app.use("/api/center", centerRoutes);
app.use("/api/vendor", usersRoutes);
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

app.listen(port);
