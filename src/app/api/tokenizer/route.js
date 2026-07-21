import midtransClient from "midtrans-client";
import { NextResponse } from "next/server";

const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
});

export async function POST(request) {
    try {
        const {
            id,
            name,
            studentNumber,
            major,
            amount,
        } = await request.json();
        // buat id + waktu, jika pembayaran expired bisa dibuat ulang tagihannya
        const midtransOrderId = `${id}_${Date.now()}`; //memisahkan id dan waktu menggunakan "_"
        const parameter = {
            transaction_details: {
                order_id: midtransOrderId, //panggil id + waktu
                gross_amount: amount,
            },
            customer_details: {
                first_name: name,
            },
            custom_field1: studentNumber,
            custom_field2: major,
        };

        const token = await snap.createTransactionToken(parameter);

        return NextResponse.json({
            token,
        });
    } catch (error) {
        console.log(error);

        return NextResponse.json(
            {
                error: error.message,
            },
            {
                status: 500,
            }
        );
    }
}