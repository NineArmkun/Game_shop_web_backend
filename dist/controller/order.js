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
    const [rows] = await DBconnect_1.conn.query("select * from orders");
    res.send(rows);
});
//select ilid by lotto 
exports.router.get("/:id", async (req, res) => {
    try {
        const connect = await DBconnect_1.conn;
        let id = +req.params.id;
        const [rows] = await connect.query("select * from orders ,lotto where lotto.lid = orders.lid and orders.lid = ? ", [id]);
        res.send(rows);
    }
    catch (err) {
        console.error("Error fetching order by id:", err);
        res.status(500).send("Internal Server Error");
    }
});
