import express from "express";
import { conn } from "../DBconnect";

export const router = express.Router();

router.post("/", (req, res) => {
  const { username, password } = req.body;

  // ✅ query หา user
  conn.query(
    "SELECT id, username, role FROM user WHERE username = ? AND password = ?",
    [username, password],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }

      if ((results as any).length === 0) {
        return res.status(401).json({ message: "username หรือ password ไม่ถูกต้อง" });
      }

      const user = (results as any)[0];
      res.json({
        id: user.id,
        username: user.username,
        password: user.password,
        role: user.role,
        token: "fake-jwt-token-" + user.id, // mock token
      });
    }
  );
});
