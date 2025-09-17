export interface Lotto {
    lid?: number;
    uid: number;
    lotto_number: string;
    date_start: string;
    date_end: string;
    price: number;
    sele_status?: string;
    lotto_result_status?: string;
}