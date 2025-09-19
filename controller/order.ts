import { log } from "console";
import { conn } from "../DBconnect";
import express from "express";
import { Orders } from "../model/order";
import { ResultSetHeader } from "mysql2";

export const router = express.Router();
//select all
router.get("/", async (req, res) => {
    const [rows] = await conn.query("select * from orders");
    res.send(rows);
});
//select ilid by lotto
router.get("/:id/paid", async (req, res) => {
    try {
        const connect = await conn;
        let id = +req.params.id;
        const [rows] = await connect.query(
            `SELECT * 
   FROM orders
   JOIN user ON user.uid = orders.uid
   JOIN lotto ON lotto.lid = orders.lid
   WHERE user.uid = ? 
     AND payment_status = ?`,
            [id, "paid"]
        );
        res.send(rows);
    } catch (err) {
        console.error("Error fetching order by id:", err);
        res.status(500).send("Internal Server Error");
    }
});
router.get("/:id/pending", async (req, res) => {
    try {
        const connect = await conn;
        let id = +req.params.id;
        const [rows] = await connect.query(
            `SELECT * 
   FROM orders
   JOIN user ON user.uid = orders.uid
   JOIN lotto ON lotto.lid = orders.lid
   WHERE user.uid = ? 
     AND payment_status = ?`,
            [id, "pending"]
        );
        res.send(rows);
    } catch (err) {
        console.error("Error fetching order by id:", err);
        res.status(500).send("Internal Server Error");
    }
});
//insert orders

router.post("/orders", async (req, res) => {

    try {
        const data: Orders = req.body;
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

        const [result] = await conn.query<ResultSetHeader>(insertQuery, values);

        const newLid = result.insertId;

        return res.status(201).json({
            message: "Lotto entry added successfully!",
            lid: newLid
        });
    } catch (err) {
        console.error("Error adding lotto entry:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});



router.post("/check_lotto", async (req, res) => {
    const { uid, lotto_number, lid } = req.body;

    try {
        const [check_lotto]: any = await conn.query(
            `SELECT * 
   FROM orders 
   JOIN user ON user.uid = orders.uid 
   JOIN winning_lotto ON winning_lotto.lid = orders.lid 
   JOIN lotto ON winning_lotto.lid = lotto.lid 
   WHERE lotto.lid = ? AND winning_lotto.winning_lotto_number = ?`,
            [lid, lotto_number]
        );

        if (check_lotto.length > 0 && lotto_number == check_lotto[0].winning_lotto_number) {
            console.log(check_lotto);
            // await conn.query("UPDATE user SET money = money + ? WHERE uid = ?", [
            //     check_lotto.price,
            //     uid,
            // ]);
            // await conn.query(
            //     "UPDATE orders SET payment_status = 'cencelled' WHERE oid = ?",
            //     [check_lotto.oid]
            // );
            return res.status(200).json({
                message: "ถูกรางวัล!",
                data: {
                    "old": check_lotto.old,
                    "prize": check_lotto.prize
                }

            });
        } else {
            return res.status(200).json({
                message: "ไม่ถูกรางวัล"

            });
        }

    } catch (err) {
        console.error("Error adding lotto entry:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
router.post("/updateMoney", async (req, res) => {
    const { uid, oid, prize } = req.body;

    try {
        const [users]: any = await conn.query(
            "SELECT money FROM user WHERE uid = ?",
            [uid]
        );

        if (!users || users.length === 0) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้" });
        }



        // หักเงิน
        await conn.query("UPDATE user SET money = money + ? WHERE uid = ?", [
            prize,
            uid,
        ]);

        // อัปเดตสถานะการชำระเงิน
        await conn.query(
            "UPDATE orders SET payment_status = 'cancelled' WHERE oid = ?",
            [oid]
        );

        res.status(200).json({ message: "ขึ้นเงินสำเร็จ" });
    } catch (error) {
        console.error("เกิดข้อผิดพลาด:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
});


router.post("/pay", async (req, res) => {
    const { uid, oid, price } = req.body;

    try {
        const [users]: any = await conn.query(
            "SELECT money FROM user WHERE uid = ?",
            [uid]
        );

        if (!users || users.length === 0) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้" });
        }

        const user = users[0];

        if (user.money < price) {
            return res.status(400).json({ message: "ยอดเงินไม่เพียงพอ" });
        }

        // หักเงิน
        await conn.query("UPDATE user SET money = money - ? WHERE uid = ?", [
            price,
            uid,
        ]);

        // อัปเดตสถานะการชำระเงิน
        await conn.query(
            "UPDATE orders SET payment_status = 'paid' WHERE oid = ?",
            [oid]
        );

        res.status(200).json({ message: "ชำระเงินสำเร็จ" });
    } catch (error) {
        console.error("เกิดข้อผิดพลาด:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
});
