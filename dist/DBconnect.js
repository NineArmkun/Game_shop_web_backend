"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.conn = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
exports.conn = promise_1.default.createPool({
    connectionLimit: 10,
    host: "202.28.34.203",
    user: "mb68_66011212013",
    password: "xjY_1gE3I(!Y",
    database: "mb68_66011212013",
    waitForConnections: true,
    queueLimit: 0,
});
console.log("MySQL pool created:", exports.conn ? true : false);
