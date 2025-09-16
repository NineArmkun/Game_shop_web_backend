import { conn } from "../DBconnect";
import express from "express";

export const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const [rows] = await conn.query("SELECT * FROM user");
        res.json(rows);
    } catch (err) {
        console.error("❌ Error fetching users:", err);
        res.status(500).send("Database error");
    }
});


router.get("/:id", async (req, res) => {
    try {
        let uid = req.params.id;
        const [rows] = await conn.query(
            "SELECT * FROM user WHERE uid = ?",
            [uid],);
        res.json(rows);

    } catch (err) {

        console.error("❌ Database error:", err);
        res.status(500).send("Database error");
        return;
    }


});



