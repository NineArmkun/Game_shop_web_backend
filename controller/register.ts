import { log } from "console";
import { conn } from "../DBconnect";
import express from "express";
import { Orders } from "../model/order";
import { ResultSetHeader } from "mysql2";
import bcrypt from "bcrypt";


export const router = express.Router();


router.post("/", async (req, res) => {
    const { username, email,
        phone,
        money,
        password } = req.body;
    const hashpassword = await bcrypt.hash(password, 10);

    const [rows] = await conn.query("SELECT * FROM user WHERE user_name = ?", [username]);
    if ((rows as any[]).length > 0) {
        return res.status(409).json({ message: "Username นี้ถูกใช้ไปแล้ว" }); // 409 Conflict

    }

    try {
        const [result] = await conn.query<ResultSetHeader>(
            'insert into user(user_name,email,password,tel,money,role_id)values (?,?,?,?,?,?)', [username, email, hashpassword, phone, money, 2])

        return res.status(200).json({
            message: "ลงทะเบียนสำเร็จ",
            userId: result.insertId,
        });

    } catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({
            message: "เกิดข้อผิดพลาดในการลงทะเบียน",
            error: err
        });
    }
})