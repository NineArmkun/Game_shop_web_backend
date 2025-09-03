"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const DBconnect_1 = require("../DBconnect");
const express_1 = __importDefault(require("express"));
exports.router = express_1.default.Router();
exports.router.get("/", (req, res) => {
    DBconnect_1.conn.query("SELECT * FROM user", (err, result, fields) => {
        if (err) {
            console.error("❌ Database error:", err);
            res.status(500).send("Database error");
            return;
        }
        res.json(result);
    });
});
