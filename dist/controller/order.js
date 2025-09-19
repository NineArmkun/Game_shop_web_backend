"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const console_1 = require("console");
const DBconnect_1 = require("../DBconnect");
const express_1 = __importDefault(require("express"));
exports.router = express_1.default.Router();
//select all
exports.router.get("/", async (req, res) => {
    const [rows] = await DBconnect_1.conn.query("select * from orders");
    res.send(rows);
});
//select ilid by lotto
exports.router.get("/:id/paid", async (req, res) => {
    try {
        const connect = await DBconnect_1.conn;
        let id = +req.params.id;
        const [rows] = await connect.query(`SELECT * 
   FROM orders
   JOIN user ON user.uid = orders.uid
   JOIN lotto ON lotto.lid = orders.lid
   WHERE user.uid = ? 
     AND payment_status = ?`, [id, "paid"]);
        res.send(rows);
    }
    catch (err) {
        console.error("Error fetching order by id:", err);
        res.status(500).send("Internal Server Error");
    }
});
exports.router.get("/:id/pending", async (req, res) => {
    try {
        const connect = await DBconnect_1.conn;
        let id = +req.params.id;
        const [rows] = await connect.query(`SELECT * 
   FROM orders
   JOIN user ON user.uid = orders.uid
   JOIN lotto ON lotto.lid = orders.lid
   WHERE user.uid = ? 
     AND payment_status = ?`, [id, "pending"]);
        res.send(rows);
    }
    catch (err) {
        console.error("Error fetching order by id:", err);
        res.status(500).send("Internal Server Error");
    }
});
//insert orders
exports.router.post("/orders", async (req, res) => {
    try {
        const data = req.body;
        const requiredFields = ['lid', 'uid', 'date', 'payment_status'];
        for (const field of requiredFields) {
            if (!(field in data)) {
                return res.status(400).json({ error: `Missing required field: ${field}` });
            }
        }
        const date = new Date(data.date).toISOString().slice(0, 19).replace('T', ' ');
        const insertQuery = `
            INSERT INTO orders ('lid', 'uid', 'date', 'payment_status')
            VALUES (?, ?, ?, ?)
        `;
        const values = [
            data.lid,
            data.uid,
            data,
            data.payment_status
        ];
        const [result] = await DBconnect_1.conn.query(insertQuery, values);
        const newLid = result.insertId;
        return res.status(201).json({
            message: "Lotto entry added successfully!",
            lid: newLid
        });
    }
    catch (err) {
        console.error("Error adding lotto entry:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.router.post("/check_lotto", async (req, res) => {
    const { uid, lotto_number, lid } = req.body;
    try {
        const [check_lotto] = await DBconnect_1.conn.query(`SELECT * 
   FROM orders 
   JOIN user ON user.uid = orders.uid 
   JOIN winning_lotto ON winning_lotto.lid = orders.lid 
   JOIN lotto ON winning_lotto.lid = lotto.lid 
   WHERE lotto.lid = ? AND winning_lotto.winning_lotto_number = ?`, [lid, lotto_number]);
        if (check_lotto.length > 0 && lotto_number == check_lotto.winning_lotto_number) {
            (0, console_1.log)(check_lotto);
            return res.status(200).json({
                message: "ถูกรางวัล!",
                data: check_lotto,
            });
        }
        else {
            return res.status(500);
        }
    }
    catch (err) {
        console.error("Error adding lotto entry:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.router.post("/pay", async (req, res) => {
    const { uid, oid, price } = req.body;
    try {
        const [users] = await DBconnect_1.conn.query("SELECT money FROM user WHERE uid = ?", [uid]);
        if (!users || users.length === 0) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้" });
        }
        const user = users[0];
        if (user.money < price) {
            return res.status(400).json({ message: "ยอดเงินไม่เพียงพอ" });
        }
        // หักเงิน
        await DBconnect_1.conn.query("UPDATE user SET money = money - ? WHERE uid = ?", [
            price,
            uid,
        ]);
        // อัปเดตสถานะการชำระเงิน
        await DBconnect_1.conn.query("UPDATE orders SET payment_status = 'paid' WHERE oid = ?", [oid]);
        res.status(200).json({ message: "ชำระเงินสำเร็จ" });
    }
    catch (error) {
        console.error("เกิดข้อผิดพลาด:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
});
