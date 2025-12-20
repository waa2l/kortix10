import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import twilio from 'twilio';

// إعدادات الخدمات (يفضل وضعها في .env)
const resend = new Resend(process.env.RESEND_API_KEY);
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, patientName, diagnosis, type } = body;

    // نص الرسالة
    const messageBody = `مرحباً ${patientName}،\nتم الرد على استشارتك الطبية بخصوص "${diagnosis}".\nيرجى الدخول للتطبيق للاطلاع على الروشتة والتعليمات.\nتمنياتنا بالشفاء العاجل.`;

    const results = { email: 'skipped', whatsapp: 'skipped' };

    // 1. إرسال بريد إلكتروني
    if (email) {
      const emailResponse = await resend.emails.send({
        from: 'Smart Clinic <noreply@yourdomain.com>',
        to: email,
        subject: 'تم الرد على استشارتك الطبية',
        html: `<div dir="rtl">
                <h2>مرحباً ${patientName}</h2>
                <p>تم الرد على استشارتك بنجاح من قبل الطبيب المعالج.</p>
                <p><strong>التشخيص المبدئي:</strong> ${diagnosis}</p>
                <a href="https://your-app-url.com/patient/consultations" style="background:#2563eb;color:white;padding:10px 20px;border-radius:5px;text-decoration:none;">عرض الروشتة</a>
               </div>`
      });
      results.email = emailResponse.error ? 'failed' : 'sent';
    }

    // 2. إرسال واتساب (يتطلب حساب Twilio مفعل)
    if (phone) {
      // تنسيق الرقم (مصر مثلاً +20)
      const formattedPhone = phone.startsWith('+') ? phone : `+20${phone.replace(/^0+/, '')}`;
      
      try {
        await twilioClient.messages.create({
          body: messageBody,
          from: 'whatsapp:+14155238886', // رقم Sandbox الخاص بـ Twilio
          to: `whatsapp:${formattedPhone}`
        });
        results.whatsapp = 'sent';
      } catch (error) {
        console.error('WhatsApp Error:', error);
        results.whatsapp = 'failed';
      }
    }

    return NextResponse.json({ success: true, results });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
