import { read, utils } from "xlsx";
import { pool } from "../config/db.js";

// export const uploadExcel = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }
//     if (!req.body.source_name) {
//       return res.status(400).json({ message: "Source name is required" });
//     }

//     // Read Excel file
//     const workbook = read(req.file.buffer, { type: "buffer" });
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];
//     let data = utils.sheet_to_json(sheet, { defval: "" });

//     // Normalize keys
//     data = data.map((row) => {
//       const normalized = {};
//       for (let key in row) {
//         const newKey = key.toString().trim().toLowerCase();
//         normalized[newKey] = row[key];
//       }
//       return normalized;
//     });

//     // Insert into batches and return ID
// const batchResult = await pool.query(
//   "INSERT INTO batches (source_name) VALUES ($1) RETURNING batch_id",
//   [req.body.source_name]
// );
// const batchId = batchResult.rows[0].batch_id;


//     // Prepare customer values
//     const values = data.map((row) => [
//       batchId,
//       row.name || row["full name"] || "",
//       row.email || row["e-mail"] || "",
//       row.mobile || row.phone || "",
//       row.address || "",
//       "pending",
//     ]);

//     // Generate placeholders for bulk insert
//     const placeholders = values
//       .map(
//         (_, i) =>
//           `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`
//       )
//       .join(", ");

//     // Flatten values for query
//     const flatValues = values.flat();

//     await pool.query(
//       `INSERT INTO customers (batch_id, name, email, mobile, address, status) VALUES ${placeholders}`,
//       flatValues
//     );

//     res.json({ message: "Excel uploaded successfully", batchId });
//   } catch (err) {
//     console.error("Error uploading excel:", err);
//     res.status(500).json({ message: "Error uploading excel" });
//   }
// };


export const uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    if (!req.body.source_name) {
      return res.status(400).json({ message: "Source name is required" });
    }

    // Read Excel file
    const workbook = read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    let data = utils.sheet_to_json(sheet, { defval: "" });

    // Normalize keys to lowercase and trim
    data = data.map((row) => {
      const normalized = {};
      for (let key in row) {
        const newKey = key.toString().trim().toLowerCase();
        normalized[newKey] = row[key];
      }
      return normalized;
    });

    // Insert into batches and get batch ID
    const batchResult = await pool.query(
      "INSERT INTO batches (source_name) VALUES ($1) RETURNING batch_id",
      [req.body.source_name]
    );
    const batchId = batchResult.rows[0].batch_id;

    // Prepare customer values
    const values = data.map((row) => {
      // Get name from possible variants
      const name = row.name || row["full name"] || row["fullname"] || "";
      const email = row.email || row["e-mail"] || row["mail"] || "";

      // Mobile normalization: remove non-digit characters
      let mobile = row.mobile || row.phone || "";
      if (mobile) {
        mobile = mobile.toString().replace(/\D/g, ""); // keep only digits
      }

      const address = row.address || row.location || "";

      return [batchId, name, email, mobile, address, "Pending",5];
    });

    // Generate placeholders for bulk insert
 const placeholders = values
  .map(
    (_, i) =>
      `($${i * 7 + 1}, $${i * 7 + 2}, $${i * 7 + 3}, $${i * 7 + 4}, $${i * 7 + 5}, $${i * 7 + 6}, $${i * 7 + 7})`
  )
  .join(", ");

    // Flatten values for query
    const flatValues = values.flat();

    await pool.query(
      `INSERT INTO customers (batch_id, name, email, mobile, address, status,status_id) VALUES ${placeholders}`,
      flatValues
    );

    res.json({ message: "Excel uploaded successfully", batchId });
  } catch (err) {
    console.error("Error uploading excel:", err);
    res.status(500).json({ message: "Error uploading excel" });
  }
};


export async function getBatches(req, res) {
  try {
    const result = await pool.query(
      "SELECT * FROM batches ORDER BY created_at DESC"
    );
    res.json(result.rows); // rows is inside result
  } catch (err) {
    console.error("Error fetching batches:", err);
    res.status(500).json({ message: "Error fetching batches" });
  }
}


export async function getCustomersByBatch(req, res) {
  try {
    const { batchId } = req.params;

    const result = await pool.query(
      "SELECT * FROM customers WHERE batch_id = $1",
      [batchId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching customers:", err);
    res.status(500).json({ message: "Error fetching customers" });
  }
}


export async function getCustomers(req, res) {
  
  try {
    const query = `
      SELECT 
        c.*, 
        b.source_name,
        u.name AS assigned_to_name
      FROM customers c
      LEFT JOIN batches b 
        ON c.batch_id = b.batch_id
      LEFT JOIN users u
        ON c.assigned_to = u.id
      ORDER BY c.id DESC
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(
      "Error fetching customers with source name and assigned user:",
      error
    );
    res.status(500).json({ message: "Server error" });
  }
}





export const getAssignedCustomers = async (req, res) => {
  try {
    const { assigned_to } = req.query;

    if (!assigned_to) {
      return res.status(400).json({ message: "assigned_to is required" });
    }

    const result = await pool.query(
      `SELECT customer_id, name, mobile, address, status, followup_datetime 
       FROM assining_customers 
       WHERE assigned_to = $1`,
      [assigned_to]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching assigned customers:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const changeStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    console.log("Updating status for customer ID:", id);

    if (!id) {
      return res.status(400).json({ success: false, error: "Invalid or missing customer ID" });
    }

    const { status, updated_by_id, updated_by_name, followup_datetime, customer_id, statusid } = req.body;

    // Only keep followup_datetime if status is Demo or Follow Up
    const finalDateTime =
      status === "Demo" || status === "Follow Up" ? followup_datetime : null;

    // ✅ Update customers table with updated_at
    await pool.query(
      `UPDATE customers 
       SET status = $1, followup_datetime = $2, updated_at = NOW() , status_id=$3
       WHERE id =$4`,
      [status, finalDateTime,statusid ,id ]
    );

    // ✅ Update assining_customers table with updated_at
    await pool.query(
      `UPDATE assining_customers 
       SET status = $1, followup_datetime = $2, updated_at = NOW() , status_id=$3
       WHERE customer_id =$4 `,
      [status, finalDateTime,  statusid , id ] 
    );

    // Fetch updated customer
    const result = await pool.query(
      `SELECT id, name, email, mobile, address, status, followup_datetime , status_id
       FROM customers 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Customer not found" });
    }

    const customer = result.rows[0];

    // Insert into lead_history
    await pool.query(
      `INSERT INTO lead_history 
       (name, email, mobile, address, status, followup_datetime, customer_id, created_at, updated_at, updated_by_id, updated_by,status_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $8, $9 ,$10)`,
      [
        customer.name,
        customer.email,
        customer.mobile,
        customer.address,
        customer.status,
        customer.followup_datetime,
        customer_id,
        updated_by_id,
        updated_by_name,
        statusid,
      ]
    );

    res.json({
      success: true,
      message: "Status & Date/Time updated and history recorded!",
    });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ success: false, error: "Failed to update status" });
  }
};


export const leadData = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT lh.*
      FROM lead_history lh
      INNER JOIN (
          SELECT name, address, mobile, MAX(id) AS max_id
          FROM lead_history
          GROUP BY name, address, mobile
      ) AS uniq
      ON lh.id = uniq.max_id
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error getting data:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};





export const dashboardBoxData = async (req, res) => {
  try {
    const query = `
      SELECT employee_name, status
      FROM assining_customers
      WHERE status = ANY($1)
      ORDER BY employee_name;
    `;

    const statuses = ['Pending', 'Demo', 'Follow Up', 'Not Picked Call', 'Deal'];

    const result = await pool.query(query, [statuses]);

    if (result.rows.length > 0) {
      res.status(200).json({ data: result.rows });
    } else {
      res.status(404).json({ message: 'No data found' });
    }
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};


export const getLeadHistoryByCustomerId = async (req, res) => {
  try {
    const { id } = req.params;

    const customerResult = await pool.query(
      `SELECT customer_id 
       FROM lead_history 
       WHERE customer_id = $1 
       LIMIT 1`,
      [id]
    );

    if (customerResult.rows.length === 0) {
      return res.status(404).json({ message: "Record not found" });
    }

    const query = `
      SELECT 
        id,
        name,
        email,
        mobile,
        address,
        status,
        updated_by,
        created_at,
        updated_at,
        customer_id
      FROM lead_history
      WHERE customer_id = $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [id]);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching lead history:", error);
    res.status(500).json({ message: "Server Error" });
  }
};



export const getName = async (req, res) => {
  try {
    const query = `
      SELECT id, name, mobile, address, email
      FROM customers
      ORDER BY id DESC
    `;

    const result = await pool.query(query); // returns { rows, rowCount }

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ message: "No customers found" });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching customers:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


// ================================= add bank details =================================


export const addBankDetails = async (req, res) => {
  try {
    const { clientId, mobile, address, bankName, accountNumber, ifsc,accountholdername } = req.body;

    if (!clientId || !bankName || !accountNumber || !ifsc || !accountholdername) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if client already has a bank record
    const { rows } = await pool.query(
      `SELECT bank_details FROM bank_master WHERE client_id = $1`,
      [clientId]
    );

    const newBank = {
      bankName,
      accountholdername,
      accountNumber,
      ifsc,
      mobile: mobile || null,
      address: address || null,
      addedAt: new Date()
    };

    if (rows.length > 0) {
      // Append new bank entry to existing JSONB array
      const updatedBanks = [...rows[0].bank_details, newBank];

      await pool.query(
        `UPDATE bank_master 
         SET bank_details = $1::jsonb, updated_at = NOW()
         WHERE client_id = $2`,
        [JSON.stringify(updatedBanks), clientId] // stringify here
      );
    } else {
      // Create new row with first bank entry
      await pool.query(
        `INSERT INTO bank_master (client_id, bank_details, created_at, updated_at)
         VALUES ($1, $2::jsonb, NOW(), NOW())`,
        [clientId, JSON.stringify([newBank])] // stringify array
      );
    }

    res.status(201).json({ message: "Bank details saved successfully" });
  } catch (error) {
    console.error("Error adding bank details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};





// =================================== get bank details ===================================

export const getBankDetails = async (req, res) => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res.status(400).json({ message: "clientId is required" });
    }

    const { rows } = await pool.query(
      `SELECT bank_details 
       FROM bank_master 
       WHERE client_id = $1`,
      [clientId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No bank details found for this client" });
    }

    // rows[0].bank_details is already JSONB, no need to parse
    res.status(200).json(rows[0].bank_details);
  } catch (error) {
    console.error("Error fetching bank details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ======================= EARNING FORM DATA =======================

export const earning = async (req, res) => {
  try {
    const { clientId, name, amount, bank, mobile, comment, receivedDate } = req.body;

    if (!clientId || !name || !amount || !bank || !mobile  || !receivedDate) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const newEarning = {
      name,
      amount,
      bank,
      mobile,
      comment: comment || null,
      receivedDate
    };
    const existingRes = await pool.query(
      "SELECT earnings_list FROM earnings WHERE client_id = $1",
      [clientId]
    );

    if (existingRes.rows.length > 0) {
      const updatedEarnings = [
        ...existingRes.rows[0].earnings_list,
        newEarning
      ];

      const updateQuery = `
                UPDATE earnings
                SET earnings_list = $1::jsonb, updated_at = NOW()
                WHERE client_id = $2
                RETURNING *
            `;
      const { rows } = await pool.query(updateQuery, [JSON.stringify(updatedEarnings), clientId]);
      return res.status(200).json({ message: "Earning appended successfully", earning: rows[0] });
    } else {
      const insertQuery = `
                INSERT INTO earnings (client_id, earnings_list)
                VALUES ($1, $2::jsonb)
                RETURNING *
            `;
      const { rows } = await pool.query(insertQuery, [clientId, JSON.stringify([newEarning])]);
      return res.status(201).json({ message: "Earning added successfully", earning: rows[0] });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ==================== Status Data id wise month wise ====================


// getStatusByDataForEmployee -----------------old ---------------------getStatusByDataForEmployee


// getStatusByDataForEmployee -----------------new---------------------getStatusByDataForEmployee




export const getStatusByDataForEmployee = async (req, res) => {
  try {
    const { start, end, month } = req.query;

    let startDate, endDate;

    if (start && end) {
      startDate = new Date(start);
      endDate = new Date(end);
      endDate.setDate(endDate.getDate() + 1);
    } else if (month) {
      const currentMonth = new Date(month);
      startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

 
    const statusRes = await pool.query("SELECT id, name FROM status_master ORDER BY id");
    const statuses = statusRes.rows;

    const sanitizeColumnName = (name, id) => {
  if (!name || name.trim() === "") {
    return `status_${id}`;
  }
  
  return name.replace(/[^a-zA-Z0-9_]/g, "_");
};

const countColumns = statuses
  .map(
    (s) =>
      `SUM(CASE WHEN ac.status_id = ${s.id} THEN 1 ELSE 0 END) AS "${sanitizeColumnName(
        s.name,
        s.id
      )}"`
  )
  .join(",\n");


    // 3. Query with LEFT JOIN (so missing statuses still give 0)
    const query = `
      SELECT
        ac.assigned_to,
        ac.employee_name,
        DATE_TRUNC('month', ac.updated_at) AS month,
        ${countColumns}
      FROM assining_customers ac
      WHERE ac.updated_at >= $1
        AND ac.updated_at < $2
      GROUP BY ac.assigned_to, ac.employee_name, month
      ORDER BY month, ac.assigned_to;
    `;

    const { rows } = await pool.query(query, [startDate, endDate]);

    res.json({ success: true, data: rows, statuses });
  } catch (err) {
    console.error("Error in getStatusByDataForEmployee:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};






// getStatusByDataForEmployee -----------------new ---------------------getStatusByDataForEmployee







// const sanitizeColumnName = (name, id) => {
//   if (!name || name.trim() === "") {
//     return `status_${id}`; // fallback name
//   }
//   // Non-alphanumeric ko "_" me convert
//   return name.replace(/[^a-zA-Z0-9_]/g, "_");
// };


// export const getStatusByDataForEmployeeCurrentDate = async (req, res) => {
//   try {
//     // 1. Get statuses
//     const statusRes = await pool.query("SELECT id, name FROM status_master ORDER BY id");
//     const statuses = statusRes.rows;

//     // 2. Build dynamic status count columns
//     const countColumns = statuses
//       .map(
//         (s) =>
//           `COUNT(*) FILTER (WHERE ac.status_id = ${s.id}) AS "${sanitizeColumnName(
//             s.name,
//             s.id
//           )}"`
//       )
//       .join(",\n");

  
//    const query = `
//   SELECT
//     u.id AS assigned_to,
//     COALESCE(ac.employee_name, u.name) || ' - ' || u.email || ' - ' || u.mobile AS employee,
//     TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS date,

  
//     ${countColumns},

    
//     (SELECT COUNT(*) 
//      FROM assining_customers ac3 
//      WHERE ac3.assigned_to = u.id 
//        AND ac3.status = 'Pending') AS total_pending,

   
//     (SELECT COUNT(*) 
//      FROM assining_customers ac2 
//      WHERE ac2.assigned_to = u.id 
//        AND ac2.status_id IS NOT NULL) AS total_lead

//   FROM users u
//   LEFT JOIN assining_customers ac
//     ON ac.assigned_to = u.id
//    AND ac.updated_at::date = CURRENT_DATE  
//    AND ac.status_id IS NOT NULL
//   WHERE u.id IN (SELECT DISTINCT assigned_to FROM assining_customers) 
//   GROUP BY 
//     u.id, u.name, u.email, u.mobile, ac.employee_name
//   ORDER BY date, u.id;
// `;



//     const { rows } = await pool.query(query);

//     res.json({ success: true, data: rows });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// };




const sanitizeColumnName = (name, id) => {
  if (!name || name.trim() === "") {
    return `status_${id}`; // fallback name
  }
  // Non-alphanumeric ko "_" me convert
  return name.replace(/[^a-zA-Z0-9_]/g, "_");
};

export const getStatusByDataForEmployeeCurrentDate = async (req, res) => {
  try {
    // 1. Get statuses
    const statusRes = await pool.query("SELECT id, name FROM status_master ORDER BY id");
    const statuses = statusRes.rows;

    // 2. Build dynamic status count columns
    const countColumns = statuses
      .map(
        (s) =>
          `COUNT(*) FILTER (WHERE ac.status_id = ${s.id}) AS "${sanitizeColumnName(
            s.name,
            s.id
          )}"`
      )
      .join(",\n");

    // 3. Query with total_today excluding Pending
    const query = `
      SELECT
        u.id AS assigned_to,
        COALESCE(ac.employee_name, u.name) || ' - ' || u.email || ' - ' || u.mobile AS employee,
        TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') AS date,

        ${countColumns},

        -- 👇 total without Pending
        COUNT(*) FILTER (WHERE ac.status_id IS NOT NULL AND ac.status != 'Pending') AS total_today,

        (SELECT COUNT(*) 
         FROM assining_customers ac3 
         WHERE ac3.assigned_to = u.id 
           AND ac3.status = 'Pending') AS total_pending,

        (SELECT COUNT(*) 
         FROM assining_customers ac2 
         WHERE ac2.assigned_to = u.id 
           AND ac2.status_id IS NOT NULL) AS total_lead

      FROM users u
      LEFT JOIN assining_customers ac
        ON ac.assigned_to = u.id
       AND ac.updated_at::date = CURRENT_DATE  
       AND ac.status_id IS NOT NULL
      WHERE u.id IN (SELECT DISTINCT assigned_to FROM assining_customers) 
      GROUP BY 
        u.id, u.name, u.email, u.mobile, ac.employee_name
      ORDER BY date, u.id;
    `;

    const { rows } = await pool.query(query);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};





//  =========================== daily Demo ===========================

export const getDailyDemos = async (req, res) => {
  try {
    const query = `
SELECT 
          TO_CHAR(followup_datetime::date, 'YYYY-MM-DD') AS demo_date,
          COUNT(*) AS total_demos,
          JSON_AGG(
              JSON_BUILD_OBJECT(
                  'id', id,
                  'name', name,
                  'mobile', mobile,
                  'assigned_to', assigned_to,
                  'employee_name', employee_name,
                  'status', status,
                  'followup_datetime', followup_datetime
              )
          ) AS demo_data
      FROM assining_customers
      WHERE status = 'Demo'
      GROUP BY followup_datetime::date
      ORDER BY demo_date;
    `;
    const { rows } = await pool.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching daily demos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



// ============================= earning data =============================

export const earningData = async (req, res) => {
  try {
    const query = `
      SELECT * FROM earnings
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching earnings data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


