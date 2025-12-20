import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import twilio from 'twilio';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, patientName, diagnosis } = body;

    const results = { email: 'skipped', whatsapp: 'skipped' };

    // --- 1. محاولة إرسال بريد (إذا وجد المفتاح) ---
    if (process.env.RESEND_API_KEY && email) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'Smart Clinic <onboarding@resend.dev>',
          to: email,
          subject: 'تحديث بخصوص استشارتك الطبية',
          html: `<p>مرحباً ${patientName}، تم الرد على استشارتك وتشخيص الحالة: <strong>${diagnosis}</strong>.</p>`
        });
        results.email = 'sent';
      } catch (e) {
        console.error('Email Error:', e);
        results.email = 'failed';
      }
    } else {
      console.log(`[Simulation] Sending Email to ${email}`);
    }

    // --- 2. محاولة إرسال واتساب (إذا وجد المفتاح) ---
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && phone) {
      try {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
          body: `مرحباً ${patientName}، تم الرد على استشارتك. التشخيص: ${diagnosis}`,
          from: 'whatsapp:+14155238886',
          to: `whatsapp:${phone}`
        });
        results.whatsapp = 'sent';
      } catch (e) {
        console.error('WhatsApp Error:', e);
        results.whatsapp = 'failed';
      }
    } else {
      console.log(`[Simulation] Sending WhatsApp to ${phone}`);
    }

    return NextResponse.json({ success: true, results });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
