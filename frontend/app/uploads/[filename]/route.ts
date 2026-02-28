import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request, { params }: { params: Promise<{ filename: string }> }) {
    try {
        const resolvedParams = await params;
        const filePath = path.join(process.cwd(), "..", "uploads", resolvedParams.filename);
        if (!fs.existsSync(filePath)) {
            return new NextResponse('Not Found', { status: 404 });
        }

        const fileBuffer = fs.readFileSync(filePath);
        const mimeType = resolvedParams.filename.endsWith('.mp4') ? 'video/mp4' : 'video/webm';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': mimeType,
            },
        });
    } catch (e) {
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
