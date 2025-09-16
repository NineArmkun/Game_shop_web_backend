"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const DBconnect_1 = require("../DBconnect");
const express_1 = __importDefault(require("express"));
exports.router = express_1.default.Router();
exports.router.get("/", async (req, res) => {
    try {
        const [rows] = await DBconnect_1.conn.query("SELECT * FROM user");
        res.json(rows);
    }
    catch (err) {
        console.error("❌ Error fetching users:", err);
        res.status(500).send("Database error");
    }
});
exports.router.get("/:id", async (req, res) => {
    try {
        let uid = req.params.id;
        const [rows] = await DBconnect_1.conn.query("SELECT * FROM user WHERE uid = ?", [uid]);
        res.json(rows);
    }
    catch (err) {
        console.error("❌ Database error:", err);
        res.status(500).send("Database error");
        return;
    }
});
