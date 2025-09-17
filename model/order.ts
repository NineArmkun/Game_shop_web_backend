export interface Order {
    oid: number;
    lid: number;
    uid: number;
    date: Date;
    payment_status: string;
    lotto_number: number;
    date_start: Date;
    date_end: Date;
    price: number;
    sele_status: number;
    lotto_result_status: number;
}
