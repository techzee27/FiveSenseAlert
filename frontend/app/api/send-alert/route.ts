import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import db from "@/lib/db";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const latitude = formData.get("latitude") as string;
        const longitude = formData.get("longitude") as string;
        const battery_level = formData.get("battery_level") as string;
        const battery_status = formData.get("battery_status") as string;
        const video = formData.get("video") as Blob;
        const whatsapp_access_token = formData.get("whatsapp_access_token") as string;
        const whatsapp_phone_number_id = formData.get("whatsapp_phone_number_id") as string;
        const whatsapp_recipients = formData.get("whatsapp_recipients") as string;

        if (!latitude || !longitude) {
            return NextResponse.json({ success: false, error: "Location data missing" }, { status: 400 });
        }

        const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        let video_url: string | null = null;
        let has_video = false;
        let filepath_mp4 = "";
        let filename_mp4 = "";

        // Use Vercel's temporary directory mapping for writing files on API routes
        const uploadsDir = os.tmpdir();

        if (video) {
            has_video = true;
            try {
                const arrayBuffer = await video.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                if (buffer.length > 0) {
                    const fileKey = Date.now().toString();
                    const webmPath = path.join(uploadsDir, `${fileKey}.webm`);
                    const mp4Path = path.join(uploadsDir, `${fileKey}.mp4`);
                    fs.writeFileSync(webmPath, buffer);

                    filepath_mp4 = mp4Path;
                    filename_mp4 = `${fileKey}.mp4`;

                    try {
                        await new Promise((resolve, reject) => {
                            ffmpeg(webmPath)
                                .outputOptions(['-c:v libx264', '-preset fast', '-c:a aac', '-b:a 128k', '-movflags +faststart', '-y'])
                                .save(mp4Path)
                                .on('end', () => resolve(true))
                                .on('error', (err) => reject(err));
                        });
                    } catch (err) {
                        console.error("FFmpeg conversion failed, falling back to WebM:", err);
                        filepath_mp4 = webmPath;
                        filename_mp4 = `${fileKey}.webm`;
                    }

                    // On Vercel this will not be a reachable URL over the internet.
                    video_url = `/tmp/${filename_mp4}`;
                } else {
                    console.error("Received empty video buffer");
                }
            } catch (e) {
                console.error("Failed to process video blob:", e);
            }
        }

        const stmt = db.prepare(`
            INSERT INTO alerts (timestamp, latitude, longitude, battery_level, battery_status, video_url)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        stmt.run(timestamp, latitude, longitude, battery_level, battery_status, video_url);

        const location_message = `🚨 EMERGENCY ALERT 🚨\n\n🚨I am in danger! Please help me !🚨\nhttps://www.google.com/maps?q=${latitude},${longitude}\n\n🔋 Battery: ${battery_level}%\n⚡ Charging: ${battery_status}`;

        const message_url = `https://graph.facebook.com/v18.0/${whatsapp_phone_number_id}/messages`;
        const headers = {
            'Authorization': `Bearer ${whatsapp_access_token}`,
            'Content-Type': 'application/json'
        };

        const recipients_list = (whatsapp_recipients || '').split(',').map(r => r.trim()).filter(r => r);
        let has_errors = false;
        let error_msg = "";

        for (const recipient of recipients_list) {
            const message_data = {
                messaging_product: 'whatsapp',
                to: recipient,
                type: 'text',
                text: { body: location_message }
            };

            const response = await fetch(message_url, {
                method: 'POST',
                headers,
                body: JSON.stringify(message_data)
            });
            const result = await response.json();
            if (!response.ok) {
                has_errors = true;
                const fbError = result?.error?.message || "Unknown Meta API error";
                error_msg += fbError ? `${recipient}: ${fbError} | ` : `${recipient}: Failed | `;
            }
        }

        if (has_video && filepath_mp4 && fs.existsSync(filepath_mp4)) {
            const upload_url = `https://graph.facebook.com/v18.0/${whatsapp_phone_number_id}/media`;
            const fileBuffer = fs.readFileSync(filepath_mp4);
            const mediaFormData = new FormData();

            const mimeType = filepath_mp4.endsWith('.mp4') ? 'video/mp4' : 'video/webm';
            const uploadFilename = filepath_mp4.endsWith('.mp4') ? "Emergency_Video.mp4" : "Emergency_Video.webm";
            // @ts-ignore
            mediaFormData.append("file", new Blob([fileBuffer], { type: mimeType }), uploadFilename);
            mediaFormData.append("messaging_product", "whatsapp");
            mediaFormData.append("type", mimeType);

            const upload_response = await fetch(upload_url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${whatsapp_access_token}`
                },
                body: mediaFormData
            });

            const upload_result = await upload_response.json();
            if (upload_response.ok && upload_result.id) {
                const media_id = upload_result.id;

                for (const recipient of recipients_list) {
                    // Use standard video type since it is properly encoded as mp4 now, fallback to document if webm
                    const msgType = filepath_mp4.endsWith('.mp4') ? 'video' : 'document';
                    const video_message_data = {
                        messaging_product: 'whatsapp',
                        to: recipient,
                        type: msgType,
                        ...(msgType === 'video' ? { video: { id: media_id } } : { document: { id: media_id, filename: uploadFilename } })
                    };

                    const doc_res = await fetch(message_url, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(video_message_data)
                    });

                    if (!doc_res.ok) {
                        const errResult = await doc_res.json();
                        console.error("Document sending failed:", errResult);
                        has_errors = true;
                        error_msg += `${recipient}: Video send failed (${errResult?.error?.message}) | `;
                    }
                }
            } else {
                console.error("Media upload failed:", upload_result);
                has_errors = true;
                error_msg += `Video Upload failed: ${upload_result?.error?.message} | `;
            }
        }

        if (has_errors) {
            return NextResponse.json({ success: false, error: error_msg }, { status: 500 });
        }

        // Cleanup local files
        try {
            if (filepath_mp4 && fs.existsSync(filepath_mp4)) {
                fs.unlinkSync(filepath_mp4);
            }
            if (filename_mp4) {
                const originalWebmPath = path.join(uploadsDir, filename_mp4.replace('.mp4', '.webm'));
                if (fs.existsSync(originalWebmPath)) {
                    fs.unlinkSync(originalWebmPath);
                }
            }
        } catch (e) {
            console.error("Cleanup error:", e);
        }

        return NextResponse.json({ success: true });

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
