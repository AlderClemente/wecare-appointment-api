const express = require("express");
const bodyParser = require("body-parser");
const pool = require("./db");
const appointmentRoutes = require("./routes/appointments");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.text({ type: "application/xml" }));

app.use("/appointments", appointmentRoutes);

app.get("/", (req, res) => {
  res.send("WeCare Appointment API is running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
