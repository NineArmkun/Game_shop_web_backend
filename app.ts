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
app.use(cors());

app.use(bodyParser.json());

app.use("/user", user);
app.use("/", index);
app.use("/login", login);
app.use("/lotto", lotto);
