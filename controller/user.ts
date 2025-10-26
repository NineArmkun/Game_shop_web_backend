import { conn } from "../DBconnect";
import express from "express";
import multer from "multer";
import { ResultSetHeader } from "mysql2/promise";
import fs from 'fs';
import { log } from "console";
import { json } from "body-parser";
import { RowDataPacket } from 'mysql2';


export const router = express.Router();
const pic_path = "Picture_Storage/UserPicture/";

const storageConfig = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, pic_path);
    }
});
const userupload = multer({ storage: storageConfig });




router.post("/userdata", async (req, res) => {
    const {
        user_id
    } = req.body;
    try {
        const [rows] = await conn.query("SELECT username, email, wallet, user_profile FROM Users WHERE user_id = ?", [user_id]);

        res.json(rows);
    } catch (err) {
        console.error("❌ Error fetching users:", err);
        res.status(500).send("Database error");
    }
});

router.post('/update_pic', userupload.single('profile_picture'), async (req, res) => {
    //   let uid = req.params.id;
    const { user_id, new_email, new_user_name } = req.body;

    let fullPathOnDisk = null;
    if (req.file) {
        // IMPORTANT: Get the full path on disk immediately.
        // This is the path Multer used to save the file.
        fullPathOnDisk = req.file.path;
    }


    const saveFilename = req.file?.filename;
    const fullpath = saveFilename;
    try {
        await conn.query(
            "UPDATE Users SET username = ?, email = ?, user_profile = ? WHERE user_id = ?",
            [new_user_name, new_email, fullpath, user_id]
        );
        try {
            const user_profile = await conn.query("SELECT user_profile FROM Users WHERE user_id = ?", [user_id]);
            const delete_previous_image = pic_path + user_profile;
            fs.unlink(delete_previous_image, (unlinkErr) => {
                if (unlinkErr) {
                    console.error("Error deleting orphaned file:", unlinkErr);
                }
                console.log('File deleted successfully:', delete_previous_image);
            })
        } catch (err) {
            console.error("❌ can't delete user previous image:", err);
        }
        res.status(200).json({ message: 'อัปเดตสำเร็จ' });
    } catch (err) {
        console.error(err);
        if (fullPathOnDisk) {

            // Use fs.unlink (or fs.unlinkSync) to delete the file
            fs.unlink(fullPathOnDisk, (unlinkErr) => {
                if (unlinkErr) {
                    // Log the deletion error, but don't stop the API response
                    console.error("Error deleting orphaned file:", unlinkErr);
                } else {
                    console.log(`Successfully deleted orphaned file: ${fullPathOnDisk}`);
                }
            });
        }
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

router.post('/update', async (req, res) => {
    //   let uid = req.params.id;
    const { new_email, new_user_name, user_id } = req.body;
    try {
        await conn.query(
            "UPDATE Users SET username = ?, email = ? WHERE user_id = ?",
            [new_user_name, new_email, user_id]
        );
        res.status(200).json({ message: 'อัปเดตสำเร็จ' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
});

router.post('/topup', async (req, res) => {
    const {
        user_id,
        money
    } = req.body
    const money_add = parseInt(money);

    try {
        // const money_left = await conn.query("select wallet from Users where user_id = ?", [user_id])
        // const money_from_database = money_left
        // const money_sum = money_from_database + money_add;

        const response = await conn.query("update Users set wallet = wallet + ? where user_id = ?", [money_add, user_id]);
        const [insertHistory] = await conn.query<ResultSetHeader>(
            "INSERT INTO HistoryTransaction (user_id, total_price, transaction_type) VALUES (?, ?, ?)",
            [user_id, money, 2]
        );
        res.status(200).json({
            "message": "Top up conplete!!",
            "return": response
        })

    } catch (err) {
        return err
    }
})

router.post("/self_Transection", async (req, res) => {
    const {
        user_id
    } = req.body
    // if (!user_id) {console.log("user id null")}
    // return res.status(200).json({
    //     "message": "user_id_null"
    // })
    try {
        const [transac] = await conn.query("select Users.username,date , total_price, transaction_type from Users, HistoryTransaction where Users.user_id = HistoryTransaction.user_id and Users.user_id = ?", [user_id]);
        return res.send(transac);

    } catch (err) {
        console.log(err);
    }

})

// router.post("/add_coupon", async (req, res) => {
//     const {

//     } = req.body
// })

router.post("/insert_coupon", async (req, res) => {
    const { coupon_code, discount_percen, coupontype, amount } = req.body;

    if (!coupon_code || !discount_percen || coupontype === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const [result] = await conn.query(
            `
      INSERT INTO DiscountCoupon (discount_coupon_code, discount_percent, discount_type, amount)
      VALUES (?, ?, ?, ?)
      `,
            [coupon_code, discount_percen, coupontype, amount || null]
        );

        res.status(200).json({
            message: "Coupon inserted successfully",
            insertId: (result as any).insertId,
        });
    } catch (err) {
        console.error("❌ Error inserting coupon:", err);
        res.status(500).json({ message: "Error inserting coupon", error: err });
    }
});


router.get("/get_coupon", async (req, res) => {
    try {
        const [couponlist] = await conn.query("SELECT * from DiscountCoupon");
        res.send(couponlist)

    } catch (err) {
        console.log(err)
    }
})

router.post("/coupon_delete", async (req, res) => {
    const {
        code
    } = req.body
    try {
        const delete_data = await conn.query("delete from DiscountCoupon where discount_coupon_code = ?", [code]);
        res.send(delete_data)

    } catch (err) {
        console.log(err)
    }
})

router.post("/found_coupon", async (req, res) => {
    const {
        code
    } = req.body

    try {
        const [res_coupon]: any = await conn.query<RowDataPacket[]>("select * from DiscountCoupon where discount_coupon_code = ?", [code]);

        const result = res_coupon[0]

        if (!result) {
            return res.status(200).json({
                coupon_found: false,
                coupon_data: res_coupon
            })
        } else {
            return res.status(200).json({
                coupon_found: true,
                coupon_data: res_coupon
            })
        }

    } catch (err) {
        console.log(err)
        return res.status(200).json({
            coupon_found: false
        })
    }

})

router.post("/used_coupon", async (req, res) => {


})


// router.get("/", async (req, res) => {
//     const [row] = await conn.query("select * from GamesList");
//     res.send(row);
// })

// router.get("/:id", async (req, res) => {
//   try {
//     let uid = req.params.id;
//     const [rows] = await conn.query(
//       "SELECT * FROM user WHERE uid = ?",
//       [uid],);
//     res.json(rows);

//   } catch (err) {

//     console.error("❌ Database error:", err);
//     res.status(500).send("Database error");
//     return;
//   }


// });

// // router.ts หรือ app.ts
// router.post('/topup/:id', async (req, res) => {
//   let uid = req.params.id;
//   const { amount } = req.body;

//   if (!uid || !amount || amount <= 0) {
//     return res.status(400).json({ message: 'ข้อมูลไม่ถูกต้อง' });
//   }

//   try {
//     // ตรวจสอบ user
//     const [users]: any = await conn.query("SELECT money FROM user WHERE uid = ?", [uid]);
//     if (!users || users.length === 0) {
//       return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
//     }

//     // เติมเงิน
//     await conn.query("UPDATE user SET money = money + ? WHERE uid = ?", [amount, uid]);

//     // ดึงยอดเงินใหม่
//     const [updatedUsers]: any = await conn.query("SELECT money FROM user WHERE uid = ?", [uid]);
//     const newMoney = updatedUsers[0].money;

//     res.status(200).json({ message: 'เติมเงินสำเร็จ', new_money: newMoney });
//   } catch (error) {
//     console.error('เกิดข้อผิดพลาด:', error);
//     res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
//   }
// });

// router.post('/update/:id', async (req, res) => {
//   let uid = req.params.id;
//   const { username, email, tel } = req.body;
//   try {
//     await conn.query(
//       "UPDATE user SET user_name = ?, email = ?, tel = ? WHERE uid = ?",
//       [username, email, tel, uid]
//     );
//     res.status(200).json({ message: 'อัปเดตสำเร็จ' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
//   }
// });

// router.delete("/delete_users", async (req, res) => {
//   try {
//     const role_id = 1;

// const [result] = await conn.query<ResultSetHeader>(
//   "DELETE FROM user WHERE role_id NOT IN (?)",
//   [[role_id]] // wrap in array if you want multiple values
// );

//     return res.status(200).json({
//       message: `Deleted all users except role_id = ${role_id}`,
//       affectedRows: result.affectedRows,
//     });
//   } catch (err) {
//     console.error("Error deleting users table:", err);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// });




