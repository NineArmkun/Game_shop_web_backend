import { log } from "console";
import { conn } from "../DBconnect";
import express from "express";
import { Orders } from "../model/order";
import { ResultSetHeader } from "mysql2";
import bcrypt from "bcrypt";
import multer from "multer";
import fs from 'fs';

const pic_path = "Picture_Storage/UserPicture/";

export const router = express.Router();
const storageConfig  = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, pic_path);
    }
});
const userupload = multer({ storage: storageConfig });


router.post("/user",userupload.single('profile_picture'), async (req, res) => {
    const {
        username,
        email,
        password,
    } = req.body;
    let fullPathOnDisk = null;
        if (req.file) {
        // IMPORTANT: Get the full path on disk immediately.
        // This is the path Multer used to save the file.
        fullPathOnDisk = req.file.path; 
    }
    const hashpassword = await bcrypt.hash(password, 10);
    const saveFilename = req.file?.filename;
    const fullpath = saveFilename;



    // const [rows] = await conn.query("SELECT * FROM Users WHERE username = ?", [username]);
    // if ((rows as any[]).length > 0) {
    //     return res.status(409).json({ message: "Username นี้ถูกใช้ไปแล้ว" }); // 409 Conflict

    // }
    // const fullpath = pic_path+filename;

    try {
        const [result] = await conn.query<ResultSetHeader>(
            'insert into Users(username, email, wallet, password, user_profile, user_role)values (?,?,?,?,?,?)', [username, email, 0, hashpassword, fullpath, 0])
            
        return res.status(200).json({
            message: "ลงทะเบียนสำเร็จ",
            userId: result.insertId,
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




router.post("/", async (req, res) => {
    const {
        username,
        email,
        password
    } = req.body;
    const hashpassword = await bcrypt.hash(password, 10);

    // const [rows] = await conn.query("SELECT * FROM Users WHERE username = ?", [username]);
    // if ((rows as any[]).length > 0) {
    //     return res.status(409).json({ message: "Username นี้ถูกใช้ไปแล้ว" }); // 409 Conflict

    // }

    try {
        const [result] = await conn.query<ResultSetHeader>(
            'insert into Users(username, email, wallet, password, user_profile, user_role)values (?,?,?,?,?,?)', [username, email, 0, hashpassword, "testpic.png", 0])

        return res.status(200).json({
            message: "ลงทะเบียนสำเร็จ",
            userId: result.insertId,
        });

    } catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({
            message: "เกิดข้อผิดพลาดในการลงทะเบียน",
            error: err
        });
    }
})