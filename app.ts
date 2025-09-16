import express from "express";
import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";

import { router as index } from "./controller/index";
import { router as user } from "./controller/user";
import { router as login } from "./controller/login";
import { router as lotto } from "./controller/lotto";

export const app = express();

// เรียกใช้ cors ก่อน route อื่น ๆ
app.use(cors({
    origin: "*",  // หรือ "*" เพื่ออนุญาตทุกโดเมน (สำหรับ dev เท่านั้น)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(bodyParser.json());

app.use(morgan('dev'));

app.use("/user", user);
app.use("/", index);
app.use("/login", login);
app.use("/lotto", lotto);
