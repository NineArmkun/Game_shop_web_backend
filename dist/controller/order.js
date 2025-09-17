"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
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
exports.router.post('/pay', async (req, res) => {
    const { uid, oid, price } = req.body;
    try {
        const [users] = await DBconnect_1.conn.query("SELECT money FROM user WHERE uid = ?", [uid]);
        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
        }
        const user = users[0];
        if (user.money < price) {
            return res.status(400).json({ message: 'ยอดเงินไม่เพียงพอ' });
        }
        // หักเงิน
        await DBconnect_1.conn.query("UPDATE user SET money = money - ? WHERE uid = ?", [price, uid]);
        // อัปเดตสถานะการชำระเงิน
        await DBconnect_1.conn.query("UPDATE orders SET payment_status = 'paid' WHERE oid = ?", [oid]);
        res.status(200).json({ message: 'ชำระเงินสำเร็จ' });
    }
    catch (error) {
        console.error('เกิดข้อผิดพลาด:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});
