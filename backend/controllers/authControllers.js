import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { pool } from "../config/db.js";
dotenv.config();
import {decryptPassword} from '../controllers/employeeController.js'

// ============================================= login ===========================================

// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body || {};
//     if (!email || !password) {
//       return res.status(400).json({ message: "Email & password required" });
//     }

//     const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
//     const user = result.rows[0]; 

//     if (!user) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     const ok = await bcrypt.compare(password, user.password);
//     if (!ok) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     const token = jwt.sign(
//       { id: user.id, role: user.role, name: user.name },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.json({
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (e) {
//     console.error("Login error:", e);
//     res.status(500).json({ message: "Server error" });
//   }
// };

export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0]; 

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 🔹 Decrypt password instead of bcrypt
    const decryptedPassword = decryptPassword(user.password, user.iv);

    if (password !== decryptedPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    console.error("Login error:", e);
    res.status(500).json({ message: "Server error" });
  }
};



