import { pool } from "../config/db.js";

// ✅ Create Status
export const createStatus = async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query(
      "INSERT INTO status_master (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Get All Statuses
export const getAllStatuses = async (req, res) => {
     console.log("Fetching statuses...");
  try {
    const result = await pool.query("SELECT * FROM status_master ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching statuses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Get Status by ID
export const getStatusById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM status_master WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Status not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Update Status
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const result = await pool.query(
      "UPDATE status_master SET name = $1 WHERE id = $2 RETURNING *",
      [name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Status not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Delete Status
export const deleteStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM status_master WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Status not found" });
    }
    res.json({ message: "Status deleted successfully" });
  } catch (error) {
    console.error("Error deleting status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
