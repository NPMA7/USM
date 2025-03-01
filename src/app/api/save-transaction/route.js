import { NextResponse } from "next/server";

let transactions = []; // Menyimpan transaksi dalam memori

export async function POST(req) {
    try {
        const data = await req.json();
        transactions.push(data); // Simpan data ke dalam array

        return NextResponse.json({ message: "Transaksi berhasil disimpan" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// API untuk mengambil transaksi berdasarkan order_id
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order_id");

    const transaction = transactions.find(tx => tx.order_id === orderId);
    if (transaction) {
        return NextResponse.json(transaction);
    } else {
        return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }
}