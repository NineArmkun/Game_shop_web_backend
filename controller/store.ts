import express from "express";
import multer from "multer";
import { conn } from "../DBconnect";
import { ResultSetHeader } from "mysql2/promise";
import fs from 'fs';
import { log } from "console";


const pic_path = "Picture_Storage/SystemPicture/";

export const router = express.Router();
const storageConfig  = multer.diskStorage({
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
    const search = "%"+search_text+"%";

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


router.post("/gameadd",userupload.single('title_picture'), async (req, res) => {
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

    }catch (err) {
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