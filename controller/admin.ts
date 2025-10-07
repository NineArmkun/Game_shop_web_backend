import { conn } from "../DBconnect";
import express from "express";
import multer from "multer";
import { ResultSetHeader } from "mysql2/promise";
import fs from 'fs';


export const router = express.Router();