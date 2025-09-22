"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const DBconnect_1 = require("../DBconnect");
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
exports.router = express_1.default.Router();
exports.router.post("/register", async (req, res) => {
    const { username, email, phone, money, password } = req.body;
    const hashpassword = await bcrypt_1.default.hash(password, 10);
    try {
        const [result] = await DBconnect_1.conn.query('insert into user(user_name,email,password,tal,money,rold_id)values (?,?,?,?,?,?)', [username, email, hashpassword, phone, money, 2]);
        return res.status(200).json({
            message: "ลงทะเบียนสำเร็จ",
            userId: result.insertId,
        });
    }
    catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({
            message: "เกิดข้อผิดพลาดในการลงทะเบียน",
            error: err
        });
    }
});
