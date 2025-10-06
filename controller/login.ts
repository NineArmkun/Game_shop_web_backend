import { conn } from "../DBconnect";
import express from "express";
import bcrypt from "bcrypt";
import { User } from "../model/user";
import jwt from 'jsonwebtoken';


export const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_VERY_STRONG_DEFAULT_SECRET_KEY';
const JWT_EXPIRY = '1h'; // Token valid for 1 hour

router.post("/user", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ตรวจสอบว่ามีข้อมูลครบหรือไม่
    if (!email || !password) {
      return res.status(400).json({ message: "ชื่อผู้ใช้และรหัสผ่านไม่ถูกต้อง!!" });
    }

    // ค้นหาผู้ใช้จากฐานข้อมูล
    const [rows] = await conn.query<User[]>(
      "SELECT * FROM Users WHERE email = ? and user_role = 0",
      [email]
    );

    // ถ้าไม่เจอผู้ใช้
    if (rows.length === 0) {
      return res.status(401).json({ message: "ไม่พบชื่อผู้ใช้นี้ในระบบ" });
    }

    const user = rows[0];

    // ตรวจสอบรหัสผ่าน
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });
    }

    const payload = {
      userId: user.user_id,
      username: user.username,
      userRole: user.user_role 
    };

        try {
        const token = jwt.sign(
            payload,      // The data to encode
            JWT_SECRET,   // The secret key used to sign the token
            { expiresIn: JWT_EXPIRY }
        );


        return res.status(200).json({
            message: "Login successful",
            token: token,
            user_id: user.user_id,
            username: user.username,
            userRole: user.user_role
        });

    } catch (err) {
        console.error("JWT Generation Error:", err);
        return res.status(500).json({ message: "Failed to generate authentication token." });
    }

  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
  }
});