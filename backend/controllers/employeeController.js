import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";
import multer from "multer";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const algorithm = "aes-256-cbc";
const secretKey = Buffer.from(process.env.SECRET_KEY, "hex"); 




export function encryptPassword(password) {
  const iv = crypto.randomBytes(16); // always 16 bytes
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(password, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { encrypted, iv: iv.toString("hex") };
}

export function decryptPassword(encryptedPassword, ivHex) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(ivHex, "hex")
  );
  let decrypted = decipher.update(encryptedPassword, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/avatars";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});
export const upload = multer({ storage });

// ========================================= create employee ======================================

// export const createEmployee = async (req, res) => {
//   try {
//     const { name, email, mobile, password, salary, target, joiningDate } = req.body;

//     if (!name || !email || !password || !salary || !target || !joiningDate) {
//       return res.status(400).json({ message: "All fields required" });
//     }

//     const existing = await pool.query(
//       "SELECT id FROM users WHERE email = $1",
//       [email]
//     );
//     if (existing.rows.length > 0) {
//       return res.status(409).json({ message: "Email already exists" });
//     }

 
//     const hash = await bcrypt.hash(password, 10);

//     let avatarPath = null;
//     if (req.file && req.file.path) {
//       avatarPath = req.file.path;
//     } else if (req.body.avatar && req.body.avatar.trim() !== "") {
//       avatarPath = req.body.avatar;
//     }

   
//     const result = await pool.query(
//       `INSERT INTO users 
//       (name, email, mobile, password, salary, target, joining_date, role, avatar) 
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
//       RETURNING id, name, email, role, avatar`,
//       [name, email, mobile || "", hash, salary, target, joiningDate, "employee", avatarPath]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (e) {
//     console.error("Error creating employee:", e);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// export const getEmployeeById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const result = await pool.query(
//       "SELECT * FROM users WHERE id = $1",
//       [id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "Employee not found" });
//     }
//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error("Error fetching employee:", err.message);
//     res.status(500).json({ message: "Failed to fetch employee" });
//   }
// };


export const createEmployee = async (req, res) => {
  try {
    const { name, email, mobile, password, salary, target, joiningDate } = req.body;

    if (!name || !email || !password || !salary || !target || !joiningDate) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Check if email already exists
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Encrypt password
    const { encrypted, iv } = encryptPassword(password);

    // Avatar (optional)
    let avatarPath = null;
    if (req.file && req.file.path) {
      avatarPath = req.file.path;
    } else if (req.body.avatar && req.body.avatar.trim() !== "") {
      avatarPath = req.body.avatar;
    }

    // Insert into DB (store encrypted password + iv)
    const result = await pool.query(
      `INSERT INTO users 
       (name, email, mobile, password, iv, salary, target, joining_date, role, avatar) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, name, email, role, avatar`,
      [name, email, mobile || "", encrypted, iv, salary, target, joiningDate, "employee", avatarPath]
    );

    res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error("Error creating employee:", e);
    res.status(500).json({ message: "Server error" });
  }
};


export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);

    if (!result.rows.length) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const employee = result.rows[0];

    // Decrypt password
    if (employee.password && employee.iv) {
      employee.password = decryptPassword(employee.password, employee.iv);
    }

    res.json(employee);
  } catch (err) {
    console.error("Error fetching employee:", err.message);
    res.status(500).json({ message: "Failed to fetch employee" });
  }
};


// ================================= get all employee ===============================================

export const getEmployees = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, mobile, role, created_at FROM users WHERE role = $1 ORDER BY id DESC",
      ["employee"]
    );

    res.json(result.rows); // Postgres me rows result.rows me aati hai
  } catch (e) {
    console.error("Error fetching employees:", e);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================== single employee ===============================

export const singleEmployee = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, target FROM users WHERE role = $1 ORDER BY id DESC",
      ["employee"]
    );

    res.json(result.rows); // PostgreSQL me rows result.rows me milti hain
  } catch (e) {
    console.error("Error fetching employee:", e);
    res.status(500).json({ message: "server error" });
  }
};



export const singleTargertEmployee = async (req, res) => {
  try {
    const { employeeId } = req.query;

    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    // PostgreSQL query with parameterized values ($1)
    const result = await pool.query(
      "SELECT id, name, email, target FROM users WHERE role = 'employee' AND id = $1",
      [employeeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(result.rows[0]); // only one record expected
  } catch (e) {
    console.error("Error fetching employee:", e);
    res.status(500).json({ message: "Server error" });
  }
};



//  =============================== assign to employee ====================================

// export const assignBatch = async (req, res) => {
//   const { distribution } = req.body;

//   if (!distribution || distribution.length === 0) {
//     return res
//       .status(400)
//       .json({ message: "Invalid request, distribution required" });
//   }

//   const conn = await pool.getConnection();
//   try {
//     await conn.beginTransaction();

//     for (const dist of distribution) {
//       const { employeeId, limit } = dist;

//       if (!employeeId || !limit) {
//         await conn.rollback();
//         return res.status(400).json({ message: "Invalid distribution entry" });
//       }

//       const [employeeRows] = await conn.query(
//         "SELECT name FROM users WHERE id = ?",
//         [employeeId]
//       );

//       if (employeeRows.length === 0) {
//         await conn.rollback();
//         return res.status(400).json({ message: "Employee not found" });
//       }

//       const employeeName = employeeRows[0].name;

//       const [customers] = await conn.query(
//         `SELECT id, name, mobile, address 
//          FROM customers 
//          WHERE assigned_to IS NULL 
//          LIMIT ?`,
//         [limit]
//       );

//       if (customers.length === 0) {
//         continue;
//       }

//       const assignData = customers.map((c) => [
//         c.id,
//         c.name,
//         c.mobile,
//         c.address,
//         employeeId,
//         employeeName,
//       ]);

//       await conn.query(
//         "INSERT INTO assining_customers (id, name, mobile, address, assigned_to, employee_name) VALUES ?",
//         [assignData]
//       );

//       const ids = customers.map((c) => c.id);
//       await conn.query(
//         "UPDATE customers SET assigned_to = ? WHERE id IN (?)",
//         [employeeId, ids]
//       );
//     }

//     await conn.commit();
//     res.json({ message: "Customers assigned successfully" });
//   } catch (err) {
//     await conn.rollback();
//     console.error("Assign error:", err);
//     res.status(500).json({ message: "Server error" });
//   } finally {
//     conn.release();
//   }
// };

export const assignBatch = async (req, res) => {
  const { distribution } = req.body;

  if (!distribution || distribution.length === 0) {
    return res
      .status(400)
      .json({ message: "Invalid request, distribution required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const dist of distribution) {
      const { employeeId, limit } = dist;

      if (!employeeId || !limit) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Invalid distribution entry" });
      }

      // Get employee name
      const employeeResult = await client.query(
        "SELECT name FROM users WHERE id = $1",
        [employeeId]
      );

      if (employeeResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Employee not found" });
      }

      const employeeName = employeeResult.rows[0].name;

      // Get unassigned customers
      const customersResult = await client.query(
        `SELECT id, name, mobile, address 
         FROM customers 
         WHERE assigned_to IS NULL 
         ORDER BY id ASC
         LIMIT $1`,
        [limit]
      );

      const customers = customersResult.rows;

      if (customers.length < limit) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: `Not enough unassigned customers for employee ${employeeName}`,
        });
      }

      // Insert into assining_customers with original customer ID
      const insertValues = [];
      const placeholders = [];
      customers.forEach((c, i) => {
        const idx = i * 8; // 8 columns now: customer_id, name, mobile, address, assigned_to, employee_name
        placeholders.push(
          `($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5}, $${idx + 6}, $${idx + 7}, $${idx + 8} )`
        );
        insertValues.push(c.id, c.name, c.mobile, c.address, employeeId, employeeName ,"Pending", 5);
      });

      await client.query(
        `INSERT INTO assining_customers (customer_id, name, mobile, address, assigned_to, employee_name , status, status_id) VALUES ${placeholders.join(
          ","
        )}`,
        insertValues
      );



      // Update assigned_to in customers
      const ids = customers.map((c) => c.id);
      if (ids.length > 0) {
        await client.query(
          `UPDATE customers SET assigned_to = $1 WHERE id = ANY($2)`,
          [employeeId, ids]
        );
      }
    }

    await client.query("COMMIT");
    res.json({ message: "Customers assigned successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Assign error:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};







// ================================ get all assigned data to particular employee =======================================



// ================================== edit employee ================================

export const editEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, mobile, password, salary, target, joiningDate } = req.body;

    // Check if employee exists
    const existingUserResult = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );

    if (existingUserResult.rows.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    let updateData = { ...existingUserResult.rows[0] };

    // Email uniqueness check if email provided
    if (email) {
      const emailCheck = await pool.query(
        "SELECT id FROM users WHERE email = $1 AND id != $2",
        [email, id]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(409).json({ message: "Email already exists" });
      }
    }

    // Update fields if provided
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (mobile) updateData.mobile = mobile;
    if (salary) updateData.salary = salary;
    if (target) updateData.target = target;
    if (joiningDate) updateData.joining_date = joiningDate;

    // Password update
  if (password) {
  const { encrypted, iv } = encryptPassword(password);
  updateData.password = encrypted;
  updateData.iv = iv;
}

    // Avatar update
    if (req.file) {
      updateData.avatar = req.file.path.replace(/\\/g, "/");
    }

    // Run update query
 await pool.query(
  `UPDATE users 
   SET name = $1, email = $2, mobile = $3, password = $4, iv = $5, salary = $6, target = $7, joining_date = $8, avatar = $9
   WHERE id = $10`,
  [
    updateData.name,
    updateData.email,
    updateData.mobile,
    updateData.password,
    updateData.iv,      
    updateData.salary,
    updateData.target,
    updateData.joining_date,
    updateData.avatar,
    id,
  ]
);

    res.json({ message: "Employee updated successfully" });
  } catch (e) {
    console.error("Update Error:", e);
    res.status(500).json({ message: "Server error" });
  }
};

// ================================= employee Dashboard data ========================

export const getEmployeeData = async (req, res) => {
  try {
    const { employeeId } = req.query;

    if (!employeeId) {
      return res.status(400).json({ message: "employeeId is required" });
    }

    // Fetch employee target
    const employeeResult = await pool.query(
      "SELECT target FROM users WHERE id = $1",
      [employeeId]
    );
    const target = employeeResult.rows.length > 0 ? employeeResult.rows[0].target : 0;

    // Fetch customer status counts and aggregated data
    const statusResult = await pool.query(
      `SELECT
        status,
        COUNT(*) AS count,
        STRING_AGG(name, ', ') AS names,
        STRING_AGG(mobile, ', ') AS mobiles,
        STRING_AGG(address, ', ') AS addresses
      FROM assining_customers
      WHERE assigned_to = $1
      GROUP BY status`,
      [employeeId]
    );

    const statusCounts = {
      pending: 0,
      deal: 0,
      follow_up: 0,
      demo_not_deal: 0,
      not_picked_call: 0,
    };

    statusResult.rows.forEach((row) => {
      const status = row.status.toLowerCase();

      if (status === "pending") statusCounts.pending = parseInt(row.count, 10);
      else if (status === "deal") statusCounts.deal = parseInt(row.count, 10);
      else if (status === "follow up" || status === "follow_up")
        statusCounts.follow_up = parseInt(row.count, 10);
      else if (status === "demo" || status === "demo_not_deal")
        statusCounts.demo_not_deal = parseInt(row.count, 10);
      else if (status === "not picked call" || status === "not_picked_call")
        statusCounts.not_picked_call = parseInt(row.count, 10);
    });

    console.log(statusResult.rows, "statusRows...");

    res.json({
      target,
      ...statusCounts,
    });
  } catch (err) {
    console.error("Error in getEmployeeData:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// ==========================================================

export const getAssignedCustomersByStatus = async (req, res) => {
  try {
    const { employeeId, status } = req.query;

    if (!employeeId || !status) {
      return res
        .status(400)
        .json({ message: "employeeId and status are required" });
    }

    const result = await pool.query(
      `SELECT id, customer_id, name, mobile, address, status, followup_datetime
       FROM assining_customers
       WHERE assigned_to = $1 AND LOWER(status) = LOWER($2)`,
      [employeeId, status]
    );

    return res.status(200).json({ data: result.rows });
  } catch (error) {
    console.error("Error in getAssignedCustomersByStatus:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ==========================================================

export const getCustomerDetailsByEmployeeId = async (req, res) => {
  try {
    const { id } = req.params; // employeeId frontend se ayega

    // Query: fetch all customers where assigned_to = employeeId
    const result = await pool.query(
      `SELECT id, name, email, mobile, address, status, created_at
       FROM customers
       WHERE assigned_to = $1
       ORDER BY created_at DESC`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No customers assigned to this employee" });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching customer details:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

