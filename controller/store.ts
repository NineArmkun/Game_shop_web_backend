import express from "express";
import multer from "multer";
import { conn } from "../DBconnect";
import { ResultSetHeader } from "mysql2/promise";
import fs from 'fs';
import { log } from "console";

import { RowDataPacket } from 'mysql2';



const pic_path = "Picture_Storage/SystemPicture/";

export const router = express.Router();
const storageConfig = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, pic_path);
    }
});
const userupload = multer({ storage: storageConfig });




router.get("/", async (req, res) => {
    const [row] = await conn.query("select * from GamesList");
    res.send(row);
})

router.post("/getgameByid", async (req, res) => {
    const {
        game_id
    } = req.body

    const [gamedata] = await conn.query("select * from GamesList where game_id = ?", [game_id]);
    res.send(gamedata);
})

router.post("/by_name", async (req, res) => {
    const {
        search_text
    } = req.body
    const search = "%" + search_text + "%";

    const [gamedata] = await conn.query("select * from GamesList where game_title like ?", [search]);
    res.send(gamedata);
})
// router.get("/count", async (req, res) => {
//     const [rows] = await conn.query("select * from lotto");
//     res.send(rows);
// });

router.post("/addcart", async (req, res) => {
    const {
        user_id,
        game_id
    } = req.body

    try {
        const add_card = await conn.query("insert into GameCart(user_id, game_id) values (?, ?)", [user_id, game_id]);
        res.status(200).json({
            message: "Insert Completed!!"
        })
        // const record = await conn.query("select username");
    } catch (err) {
        res.status(200).json({
            message: err
        })
    }
})


router.post("/gameadd", userupload.single('title_picture'), async (req, res) => {
    const {
        adminid,
        gametitle,
        category,
        description,
        price
    } = req.body;

    let fullPathOnDisk = null;
    if (req.file) {
        // IMPORTANT: Get the full path on disk immediately.
        // This is the path Multer used to save the file.
        fullPathOnDisk = req.file.path;
    }
    const saveFilename = req.file?.filename;
    const fullpath = saveFilename;
    try {
        const [result] = await conn.query<ResultSetHeader>(
            'insert into GamesList(admin_id, game_title, category, price, game_picture_title, description)values (?,?,?,?,?,?)', [adminid, gametitle, category, price, fullpath, description])

        return res.status(200).json({
            message: "เพิ่มเกมสำเร็จ",
            game_id: result.insertId,
        });

    } catch (err) {
        console.error("Register error:", err);

        // Check if a file was successfully uploaded by Multer before the failure
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
        return res.status(500).json({
            message: "เกิดข้อผิดพลาดในการลงทะเบียน",
            error: err
        });
    }
})

router.post("/game_delete", async (req, res) => {
    const {
        game_id
    } = req.body
    try {
        const delete_reslute = conn.query("DELETE FROM GamesList WHERE game_id = ?", [game_id]);
        return res.status(200).json({
            message: "delete complete!!",
            retutn: delete_reslute
        })

    } catch (err) {
        return res.status(200).json({
            message: "delete Uncomplete!!",
            retutn: err
        })
    }
})

router.post("/gamelist_fromcart", async (req, res) => {
    const {
        user_id
    } = req.body

    try {
        const [rows] = await conn.query("SELECT GamesList.game_id, GamesList.admin_id, GamesList.game_title, GamesList.category, GamesList.price, GamesList.game_picture_title, GamesList.description, GamesList.release_date FROM GamesList, GameCart WHERE GameCart.game_id = GamesList.game_id and GameCart.status = 0 and GameCart.user_id = ?", [user_id]);
        res.send(rows);
    } catch (err) {
        console.log(err);

    }
})

router.post("/purchase", async (req, res) => {
    const {
        game_id,
        user_id
    } = req.body

    try {
        // const usermoney = await conn.query("select wallet from Users where user_id = ?", [user_id])
        // const gameprice = await conn.query("select price from GamesList where game_id = ?", [game_id])
        const update = await conn.query("update GameCart set status = 1 where user_id = ? and game_id = ?", [user_id, game_id]);

        res.send(update)

    } catch (err) {
        console.log(err);

    }

})

// router.post("/purchase_all_cart", async (req, res) => {
//     const {
//         user_id,
//         user_wallet_left
//     } = req.body

//     try {
//         const [cart] = await conn.query(
//             `SELECT gc.game_id, gl.price 
//        FROM GameCart gc 
//        JOIN GamesList gl ON gc.game_id = gl.game_id
//        WHERE gc.user_id = ? AND gc.status = 0`,
//             [user_id])


//         await conn.beginTransaction();

//         await conn.query(
//       `UPDATE Users SET wallet =  ? WHERE user_id = ?`,
//       [user_wallet_left, user_id]);

//     const [result] = await conn.query<ResultSetHeader>(
//       `INSERT INTO HistoryTransaction (user_id, total_price, transaction_type)
//        VALUES (?, ?, ?)`,
//       [user_id, user_wallet_left, 1]
//     );

//     const historyId = result.insertId;

//     for (const item of cart as any[]) {
//       await conn.query(
//         `INSERT INTO HistoryItems (history_id, game_id, price) VALUES (?, ?, ?)`,
//         [historyId, item.game_id, item.price]
//       );
//     }

//     for (const item of cart as any[]) {
//         await conn.query(`UPDATE GameCart SET status = ? WHERE user_id = ? and game_id = ?`, [1, user_id, item.game_id]);
//     }

//     res.status(200).json({
//       message: 'Purchase successful!',
//       history_id: historyId,
//       total_price: user_wallet_left,
//       games: cart
//     });
//     } catch (err) {

//     res.status(500).json({ message: 'Error completing purchase', error: err });
//     }
// })


router.post("/purchase_all_cart", async (req, res) => {
    const { user_id, user_wallet_left, total_price } = req.body;
    let connection;

    try {
        // ✅ Get a real connection from pool
        connection = await conn.getConnection();

        // ✅ Begin transaction
        await connection.beginTransaction();

        const [cart] = await connection.query(
            `SELECT gc.game_id, gl.price 
       FROM GameCart gc 
       JOIN GamesList gl ON gc.game_id = gl.game_id
       WHERE gc.user_id = ? AND gc.status = 0`,
            [user_id]
        );

        // if (!cart || cart.length === 0) {
        //   await connection.rollback();
        //   return res.status(200).json({ message: "Cart is empty!" });
        // }

        await connection.query(
            "UPDATE Users SET wallet = ? WHERE user_id = ?",
            [user_wallet_left, user_id]
        );

        const [insertHistory] = await connection.query<ResultSetHeader>(
            "INSERT INTO HistoryTransaction (user_id, total_price, transaction_type) VALUES (?, ?, ?)",
            [user_id, total_price, 1]
        );

        const historyId = insertHistory.insertId;

        for (const item of cart as any[]) {
            await connection.query(
                "INSERT INTO HistoryItems (history_id, game_id, price) VALUES (?, ?, ?)",
                [historyId, item.game_id, item.price]
            );
        }

        await connection.query(
            "UPDATE GameCart SET status = 1 WHERE user_id = ? AND status = 0",
            [user_id]
        );

        await connection.commit();
        connection.release();

        res.status(200).json({
            message: "Purchase Completed!!",
            history_id: historyId,
            total_price: user_wallet_left,
            games: cart
        });
    } catch (err) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        console.error("❌ Purchase error:", err);
        res.status(500).json({ message: "Error completing purchase", error: err });
    }
});





router.post("/cancel_cart", async (req, res) => {
    const {
        user_id,
        game_id
    } = req.body
    try {
        const delete_reslute = conn.query("DELETE FROM GameCart WHERE game_id = ? and user_id = ?", [game_id, user_id]);
        return res.status(200).json({
            message: "delete complete!!",
            retutn: delete_reslute
        })

    } catch (err) {
        return res.status(200).json({
            message: "delete Uncomplete!!",
            retutn: err
        })
    }


})


router.post("/user_stored", async (req, res) => {
    const {
        user_id
    } = req.body
    try {
        if (!user_id) {
            return res.status(400).json({ error: "user_id is required" });
        }
        const [user_stored] = await conn.query("SELECT GameCart.game_id, GamesList.game_title, GamesList.category, GamesList.price, GamesList.game_picture_title FROM GameCart, GamesList WHERE GamesList.game_id = GameCart.game_id and GameCart.status = 1 and GameCart.user_id = ?", [user_id]);
        res.send(user_stored)
    } catch (err) {
        res.send(err)
    }
});

router.post("/check_game_has", async (req, res) => {
  const { game_id, user_id } = req.body;

  try {
    const [rows]: any = await conn.query<RowDataPacket[] >(
      `
      SELECT 
        u.user_id,
        gc.game_id AS in_cart,
        ugs.game_id AS owned
      FROM Users u
      LEFT JOIN GameCart gc 
        ON u.user_id = gc.user_id AND gc.game_id = ?  
      LEFT JOIN UserGameStored ugs 
        ON u.user_id = ugs.user_id AND ugs.game_id = ?
      WHERE u.user_id = ?;
      `,
      [game_id, game_id, user_id]
    );

    const result = rows[0]; // ✅ Always take the first row (since user_id is unique)

    if (!result) {
      return res.status(200).json({ hasGame: false, status: "none" });
    }

    if (result.owned) {
      return res.status(200).json({ hasGame: true, status: "owned" });
    }

    if (result.in_cart) {
      return res.status(200).json({ hasGame: true, status: "in_cart" });
    }

    return res.status(200).json({ hasGame: false, status: "none" });

  } catch (err) {
    console.error("check_game_has error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/get_game_rank", async (req, res) => {

    try {

        const [gamerank] = await conn.query(`SELECT 
    GameCart.game_id, 
    COUNT(*) AS total_purchased, 
    GamesList.game_title, 
    GamesList.game_picture_title
FROM 
    GameCart
JOIN 
    GamesList ON GameCart.game_id = GamesList.game_id
WHERE 
    GameCart.status = 1
GROUP BY 
    GameCart.game_id
ORDER BY 
    total_purchased DESC
LIMIT 10;`)

        res.send(gamerank);
    } catch (err) {
        res.status(200).json({
            messaage: err
        })

    }
})