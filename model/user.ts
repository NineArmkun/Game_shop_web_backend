import { RowDataPacket } from "mysql2";

export interface User extends RowDataPacket {
    uid: number;
    user_name: string;
    email: string;
    password: string;
    tel: string;
    money: number;
    role_id: number;
}
