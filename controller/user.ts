import { conn } from "../DBconnect";
import express from "express";
import { ResultSetHeader } from "mysql2/promise";

export const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await conn.query("SELECT * FROM user");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).send("Database error");
  }
});


router.get("/:id", async (req, res) => {
  try {
    let uid = req.params.id;
    const [rows] = await conn.query(
      "SELECT * FROM user WHERE uid = ?",
      [uid],);
    res.json(rows);

  } catch (err) {

    console.error("❌ Database error:", err);
    res.status(500).send("Database error");
    return;
  }


});

// router.ts หรือ app.ts
router.post('/topup/:id', async (req, res) => {
  let uid = req.params.id;
  const { amount } = req.body;

  if (!uid || !amount || amount <= 0) {
    return res.status(400).json({ message: 'ข้อมูลไม่ถูกต้อง' });
  }

  try {
    // ตรวจสอบ user
    const [users]: any = await conn.query("SELECT money FROM user WHERE uid = ?", [uid]);
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    }

    // เติมเงิน
    await conn.query("UPDATE user SET money = money + ? WHERE uid = ?", [amount, uid]);

    // ดึงยอดเงินใหม่
    const [updatedUsers]: any = await conn.query("SELECT money FROM user WHERE uid = ?", [uid]);
    const newMoney = updatedUsers[0].money;

    res.status(200).json({ message: 'เติมเงินสำเร็จ', new_money: newMoney });
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

router.post('/update/:id', async (req, res) => {
  let uid = req.params.id;
  const { username, email, tel } = req.body;
  try {
    await conn.query(
      "UPDATE user SET user_name = ?, email = ?, tel = ? WHERE uid = ?",
      [username, email, tel, uid]
    );
    res.status(200).json({ message: 'อัปเดตสำเร็จ' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
  }
});

router.delete("/delete_users", async (req, res) => {
  try {
    const role_id = 1;

const [result] = await conn.query<ResultSetHeader>(
  "DELETE FROM user WHERE role_id NOT IN (?)",
  [[role_id]] // wrap in array if you want multiple values
);

    return res.status(200).json({
      message: `Deleted all users except role_id = ${role_id}`,
      affectedRows: result.affectedRows,
    });
  } catch (err) {
    console.error("Error deleting users table:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});




