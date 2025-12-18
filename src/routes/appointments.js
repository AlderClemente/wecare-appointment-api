const express = require("express");
const router = express.Router();
const pool = require("../db");
const { parseXML, sendResponse } = require("../utils/formatHandler");

/*
TABLE: appointments
Columns:
id, patient_name, email, appointment_date, reason, status, created_at
*/

//
// 1. GET /appointments — Fetch all appointments
//
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM appointments ORDER BY id ASC"
    );

    return sendResponse(req, res, {
      success: true,
      count: result.rows.length,
      appointments: result.rows
    });
  } catch (err) {
    console.error(err);

    return sendResponse(req, res, {
      success: false,
      message: "Database error"
    }, 500);
  }
});

//
// 2. POST /appointments — Create new appointment
//
router.post("/", async (req, res) => {
  try {
    let data = req.body;

    // Handle XML input
    if (req.headers["content-type"] === "application/xml") {
      const parsed = await parseXML(req.body);
      data = parsed.appointment;
    }

    const { patient_name, email, appointment_date, reason, status } = data;

    const result = await pool.query(
      `INSERT INTO appointments 
       (patient_name, email, appointment_date, reason, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        patient_name,
        email,
        appointment_date,
        reason,
        status || "Pending",
      ]
    );

    sendResponse(req, res, result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

//
// 3. GET /appointments/:id — Fetch appointment by ID
//
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM appointments WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    sendResponse(req, res, result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

//
// 4. PUT /appointments/:id — Update appointment
//
router.put("/:id", async (req, res) => {
  try {
    let data = req.body;

    if (req.headers["content-type"] === "application/xml") {
      const parsed = await parseXML(req.body);
      data = parsed.appointment;
    }

    const { patient_name, email, appointment_date, reason, status } = data;

    const result = await pool.query(
      `UPDATE appointments SET
        patient_name = $1,
        email = $2,
        appointment_date = $3,
        reason = $4,
        status = $5
       WHERE id = $6
       RETURNING *`,
      [
        patient_name,
        email,
        appointment_date,
        reason,
        status,
        req.params.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    sendResponse(req, res, result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

//
// 5. DELETE /appointments/:id — Delete appointment
//
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM appointments WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    sendResponse(req, res, result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

module.exports = router;
