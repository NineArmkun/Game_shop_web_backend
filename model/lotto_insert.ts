export interface Lotto {
    lid?: number;
    uid: number;
    lotto_number: string;
    date_start: string;
    date_end: string;
    price: number;
    sale_status?: number;
    lotto_result_status?: number;
}