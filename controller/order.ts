import { conn } from "../DBconnect";
import express from "express";

export const router = express.Router();
//select all
router.get("/", async (req, res) => {
    const [rows] = await conn.query("select * from orders");
    res.send(rows);
});
//select ilid by lotto 
router.get("/:id/paid", async (req, res,) => {
    try {
        const connect = await conn;
        let id = +req.params.id;
        const [rows] = await connect.query("select * from orders ,lotto where lotto.lid = orders.lid and orders.lid = ? AND payment_status = ?", [id, "paid"]);
        res.send(rows);
    } catch (err) {
        console.error("Error fetching order by id:", err);
        res.status(500).send("Internal Server Error");

    }
});
router.get("/:id/pending", async (req, res,) => {
    try {
        const connect = await conn;
        let id = +req.params.id;
        const [rows] = await connect.query("select * from orders ,lotto where lotto.lid = orders.lid and orders.lid = ? AND payment_status = ?", [id, "pending"]);
        res.send(rows);
    } catch (err) {
        console.error("Error fetching order by id:", err);
        res.status(500).send("Internal Server Error");

    }
});


