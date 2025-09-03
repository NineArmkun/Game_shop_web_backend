import { conn } from "../DBconnect";
import express from "express";

export const router = express.Router();

router.get("/", (req, res) => {
  conn.query("SELECT * FROM user", (err, result, fields) => {
    if (err) {
      console.error("❌ Database error:", err);
      res.status(500).send("Database error");
      return;
    }
    res.json(result);
  });
});
