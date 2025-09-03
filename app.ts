import express from "express";
import { router as index } from "./controller/index";
import { router as user } from "./controller/user";

export const app = express();
app.use("/user", user);

app.use("/", index);
// app.use("/", (req, res) => {
//   res.send("Hello World!!!");
// });