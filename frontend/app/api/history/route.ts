import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
    try {
        const stmt = db.prepare("SELECT * FROM alerts ORDER BY id DESC");
        const alerts = stmt.all() as any[];

        const historyData = alerts.map((alert) => ({
            id: String(alert.id),
            date: alert.timestamp,
            latitude: alert.latitude,
            longitude: alert.longitude,
            battery: alert.battery_level + "%",
            deliveryStatus: 'delivered',
            label: 'Emergency Alert',
            location: `${alert.latitude}, ${alert.longitude}`,
            video_url: alert.video_url
        }));

        return NextResponse.json(historyData);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
