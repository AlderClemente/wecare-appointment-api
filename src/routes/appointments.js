const express = require("express");
const router = express.Router();
const { parseXML, sendResponse } = require("../utils/formatHandler");

// Temporary in-memory data (no DB yet)
let appointments = [
  {
    id: 1,
    patient_id: 1,
    appointment_date: "2025-12-20",
    status: "Pending",
  },
];

// 1. GET /appointments
router.get("/", (req, res) => {
  sendResponse(req, res, appointments);
});

// 2. POST /appointments
router.post("/", async (req, res) => {
  let data = req.body;

  // If XML input
  if (req.headers["content-type"] === "application/xml") {
    const parsed = await parseXML(req.body);
    data = parsed.appointment;
  }

  const newAppointment = {
    id: appointments.length + 1,
    ...data,
  };

  appointments.push(newAppointment);
  sendResponse(req, res, newAppointment);
});

// 3. GET /appointments/:id
router.get("/:id", (req, res) => {
  const appointment = appointments.find(
    (a) => a.id === parseInt(req.params.id)
  );

  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  sendResponse(req, res, appointment);
});

// 4. PUT /appointments/:id
router.put("/:id", async (req, res) => {
  let data = req.body;

  if (req.headers["content-type"] === "application/xml") {
    const parsed = await parseXML(req.body);
    data = parsed.appointment;
  }

  const index = appointments.findIndex(
    (a) => a.id === parseInt(req.params.id)
  );

  if (index === -1) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  appointments[index] = {
    ...appointments[index],
    ...data,
  };

  sendResponse(req, res, appointments[index]);
});

// 5. DELETE /appointments/:id
router.delete("/:id", (req, res) => {
  const index = appointments.findIndex(
    (a) => a.id === parseInt(req.params.id)
  );

  if (index === -1) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  const deleted = appointments.splice(index, 1);
  sendResponse(req, res, deleted[0]);
});

module.exports = router;
