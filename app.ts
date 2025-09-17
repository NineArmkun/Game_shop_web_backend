import express from "express";
import morgan from "morgan";
import cor from "cors";
import bodyParser from "body-parser";
import { router as login } from "./controller/login";
import { router as index } from "./controller/index";
import { router as user } from "./controller/user";
import { router as lotto } from "./controller/lotto";
import { router as order } from "./controller/order";

export const app = express();


// app.use(morgan('dev'));
// app.use(    cor()  );
// app.use(bodyParser.text);
app.use(bodyParser.json());
app.use("/user", user);
app.use("/", index);
app.use("/login", login);
app.use("/lotto", lotto)
app.use("/order", order);
// app.use("/", (req, res) => {
//   res.send("Hello World!!!");
// });
