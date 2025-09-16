"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const index_1 = require("./controller/index");
const user_1 = require("./controller/user");
const login_1 = require("./controller/login");
const lotto_1 = require("./controller/lotto");
exports.app = (0, express_1.default)();
// เรียกใช้ cors ก่อน route อื่น ๆ
exports.app.use((0, cors_1.default)({
    origin: "*", // หรือ "*" เพื่ออนุญาตทุกโดเมน (สำหรับ dev เท่านั้น)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
exports.app.use(body_parser_1.default.json());
exports.app.use((0, morgan_1.default)('dev'));
exports.app.use("/user", user_1.router);
exports.app.use("/", index_1.router);
exports.app.use("/login", login_1.router);
exports.app.use("/lotto", lotto_1.router);
