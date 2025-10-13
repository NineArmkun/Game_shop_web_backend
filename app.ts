import express from "express";
import bodyParser from "body-parser";
import { router as login } from "./controller/login";
import { router as index } from "./controller/index";
import { router as user } from "./controller/user";
import { router as register } from "./controller/register";
import { router as store } from "./controller/store";
import path from "path";
import cors from "cors"

export const app = express();


// app.use(morgan('dev'));
// app.use(    cor()  );
// app.use(bodyParser.text);

app.use(cors({
  origin: [
    "https://backendgameshop.web.app",   // your deployed frontend
    "http://localhost:4200"              // your local Angular dev (optional)
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.json());
app.use('/user_pictures', express.static(path.join(__dirname, 'Picture_Storage', 'UserPicture')));
app.use('/system_picture', express.static(path.join(__dirname, 'Picture_Storage', 'SystemPicture')))
app.use("/user", user);
app.use("/", index);
app.use("/login", login);
app.use("/store", store);
app.use("/register", register);

// app.use("/", (req, res) => {
//   res.send("Hello World!!!");
// });
