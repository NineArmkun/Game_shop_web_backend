import { conn } from "../DBconnect";
import express from "express";
import { Lotto as lotto_insert } from "../model/lotto_insert";
import { ResultSetHeader } from "mysql2/promise";

export const router = express.Router();
//select all
router.get("/", async (req, res) => {
    const [rows] = await conn.query("select * from lotto");
    res.send(rows);
});
//select ilid by lotto 
router.get("/:id", async (req, res,) => {
    try {
        const connect = await conn;
        let id = +req.params.id;
        const [rows] = await connect.query("select * from lotto where lid = ?", [id]);
        res.send(rows);
    } catch (err) {
        console.error("Error fetching lotto by id:", err);
        res.status(500).send("Internal Server Error");

    }
});

router.post("/add_lotto", async (req, res) => {

    try {
        const data: lotto_insert = req.body;
        const requiredFields = ['uid', 'lotto_number', 'date_start', 'date_end', 'price'];
        for (const field of requiredFields) {
            if (!(field in data)) {
                return res.status(400).json({ error: `Missing required field: ${field}` });
            }
        }
                const dateStart = new Date(data.date_start).toISOString().slice(0, 19).replace('T', ' ');
        const dateEnd = new Date(data.date_end).toISOString().slice(0, 19).replace('T', ' ');

        const insertQuery = `
            INSERT INTO lotto (uid, lotto_number, date_start, date_end, price, sale_status, lotto_result_status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            data.uid,
            data.lotto_number,
            dateStart,
            dateEnd,
            data.price,
            data.sale_status || null,
            data.lotto_result_status || null
        ];

        const [result] = await conn.query<ResultSetHeader>(insertQuery, values);
        
        const newLid = result.insertId;

        return res.status(201).json({ 
            message: "Lotto entry added successfully!", 
            lid: newLid 
        });
    }catch (err) {
        console.error("Error adding lotto entry:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
router.post("/add_winning_lotto", async (req, res) => {
    try {
        const data = req.body;

        // Required fields
        const requiredFields = ["lid", "winning_lotto_number", "rank", "date", "prize"];
        for (const field of requiredFields) {
            if (!(field in data)) {
                return res.status(400).json({ error: `Missing required field: ${field}` });
            }
        }

        // Format date
        const drawDate = new Date(data.date).toISOString().slice(0, 10); // YYYY-MM-DD

        // Insert query (escape reserved keywords with backticks)
        const insertQuery = `
            INSERT INTO winning_lotto (lid, winning_lotto_number, \`rank\`, \`date\`, prize)
            VALUES (?, ?, ?, ?, ?)
        `;

        const values = [
            data.lid,
            data.winning_lotto_number,
            data.rank,
            drawDate,
            data.prize
        ];

        const [result] = await conn.query<ResultSetHeader>(insertQuery, values);

        return res.status(201).json({
            message: "Winning lotto entry added successfully!",
            wid: result.insertId
        });

    } catch (err) {
        console.error("Error adding winning lotto entry:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});





