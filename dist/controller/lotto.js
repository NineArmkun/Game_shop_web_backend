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
    const [rows] = await DBconnect_1.conn.query("select * from lotto");
    res.send(rows);
});
//select ilid by lotto 
exports.router.get("/:id", async (req, res) => {
    try {
        const connect = await DBconnect_1.conn;
        let id = +req.params.id;
        const [rows] = await connect.query("select * from lotto where lid = ?", [id]);
        res.send(rows);
    }
    catch (err) {
        console.error("Error fetching lotto by id:", err);
        res.status(500).send("Internal Server Error");
    }
});
exports.router.post("/add_lotto", async (req, res) => {
    try {
        const data = req.body;
        const requiredFields = ['uid', 'lotto_number', 'date_start', 'date_end', 'price'];
        for (const field of requiredFields) {
            if (!(field in data)) {
                return res.status(400).json({ error: `Missing required field: ${field}` });
            }
        }
        const dateStart = new Date(data.date_start).toISOString().slice(0, 19).replace('T', ' ');
        const dateEnd = new Date(data.date_end).toISOString().slice(0, 19).replace('T', ' ');
        const insertQuery = `
            INSERT INTO lotto (uid, lotto_number, date_start, date_end, price, sele_status, lotto_result_status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            data.uid,
            data.lotto_number,
            dateStart,
            dateEnd,
            data.price,
            data.sele_status || null,
            data.lotto_result_status || null
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
