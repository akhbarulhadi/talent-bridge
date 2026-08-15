import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Konfigurasi transporter Gmail gratisan
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mst_inbox")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const { talent_id, talent_email, subject, message } = body;

  const { data: { user } } = await supabase.auth.getUser();

  try {
    // 1. Kirim email asli via Gmail SMTP
    await transporter.sendMail({
      from: `"Talent Bridge HR Portal" <${process.env.EMAIL_USER}>`,
      to: talent_email,
      subject: subject,
      text: message,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #4f46e5;">Message from Talent Bridge HR Team</h2>
              <p>${message.replace(/\n/g, '<br>')}</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #666;">This email is sent automatically via the recruitment system.</p>
            </div>`,
    });

    // 2. Jika berhasil terkirim, simpan riwayatnya ke tabel mst_inbox Supabase
    const { data, error } = await supabase
      .from("mst_inbox")
      .insert([
        {
          hr_id: user?.id || null,
          talent_id,
          talent_email,
          subject,
          message,
          status: "sent",
        },
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data[0]);
  } catch (err: any) {
    console.error("Failed to send email:", err);
    return NextResponse.json({ error: "Failed to send email via SMTP: " + err.message }, { status: 500 });
  }
}