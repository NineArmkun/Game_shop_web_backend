"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const DBconnect_1 = require("../DBconnect");
exports.router = express_1.default.Router();
exports.router.post("/", (req, res) => {
    const { username, password } = req.body;
    // ✅ query หา user
    DBconnect_1.conn.query("SELECT id, username, role FROM user WHERE username = ? AND password = ?", [username, password], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }
        if (results.length === 0) {
            return res.status(401).json({ message: "username หรือ password ไม่ถูกต้อง" });
        }
        const user = results[0];
        res.json({
            id: user.id,
            username: user.username,
            password: user.password,
            role: user.role,
            token: "fake-jwt-token-" + user.id, // mock token
        });
    });
});
