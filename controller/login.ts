import { conn } from "../DBconnect";
import express from "express";
import bcrypt from "bcrypt";
import { User } from "../model/user";

export const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { user_name, password } = req.body;

    // ตรวจสอบว่ามีข้อมูลครบหรือไม่
    if (!user_name || !password) {
      return res.status(400).json({ message: "ชื่อผู้ใช้และรหัสผ่านไม่ถูกต้อง!!" });
    }

    // ค้นหาผู้ใช้จากฐานข้อมูล
    const [rows] = await conn.query<User[]>(
      "SELECT * FROM user WHERE user_name = ?",
      [user_name]
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

    // ถ้ารหัสผ่านถูกต้อง ส่งข้อมูลผู้ใช้กลับ
    res.json([{
      uid: user.uid,
      username: user.user_name,
      email: user.email,
      tel: user.tel,
      money: user.money,
      role_id: user.role_id,
      login_match: true,
    }]);

  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
  }
});