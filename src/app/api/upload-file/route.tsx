import { NextRequest, NextResponse } from "next/server";
import { uploadFile}  from "@/lib/uploadFile";
import questionsGenerator from "@/lib/questionsGenerator";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const pdfText = formData.get("pdftext") as string;
        const questions = await questionsGenerator(pdfText);
        return NextResponse.json({ questions }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
}