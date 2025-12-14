# دليل النشر والتثبيت

## Smart Medical Queue Management System - دليل النشر الشامل

هذا الدليل يشرح كيفية نشر وتثبيت نظام إدارة الطوابير الطبية الذكي.

---

## المتطلبات الأساسية

### 1. البرامج المطلوبة
- **Node.js**: الإصدار 18 أو أحدث
- **npm**: الإصدار 9 أو أحدث
- **Git**: لاستنساخ المشروع
- **متصفح حديث**: Chrome, Firefox, Safari, Edge

### 2. الحسابات المطلوبة
- **Supabase Account**: لقاعدة البيانات
- **Domain Name** (اختياري): للنشر على الإنترنت
- **SSL Certificate** (اختياري): للأمان

---

## خطوات التثبيت المحلي

### الخطوة 1: استنساخ المشروع

```bash
git clone <repository-url>
cd qms
```

### الخطوة 2: تثبيت المكتبات

```bash
npm install --legacy-peer-deps
```

### الخطوة 3: إعداد Supabase

#### أ. إنشاء مشروع Supabase

1. اذهب إلى [Supabase](https://supabase.com)
2. انقر على "New Project"
3. أدخل اسم المشروع واختر المنطقة
4. انتظر إنشاء المشروع

#### ب. تشغيل SQL Schema

1. افتح SQL Editor في Supabase
2. انسخ محتوى ملف `database-schema.sql`
3. الصق الكود في SQL Editor
4. انقر على "Run"

#### ج. نسخ بيانات الاتصال

1. اذهب إلى Settings > API
2. انسخ:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

### الخطوة 4: إعداد متغيرات البيئة

أنشئ ملف `.env.local` في جذر المشروع:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application
NEXT_PUBLIC_APP_NAME=Smart Medical Queue Management System
NEXT_PUBLIC_APP_VERSION=1.0.0

# Audio
NEXT_PUBLIC_AUDIO_PATH=/audio
NEXT_PUBLIC_SPEECH_RATE=1

# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### الخطوة 5: إعداد ملفات الصوت

1. أنشئ مجلد `public/audio`
2. أضف الملفات الصوتية:

```
public/audio/
├── ding.mp3                    # صوت التنبيه
├── 1.mp3 إلى 200.mp3          # أرقام العملاء
├── clinic1.mp3 إلى clinic10.mp3 # أسماء العيادات
└── instant1.mp3 إلى instant10.mp3 # رسائل فورية
```

### الخطوة 6: تشغيل المشروع محلياً

```bash
npm run dev
```

الموقع سيكون متاحاً على: `http://localhost:3000`

---

## النشر على الإنترنت

### خيار 1: النشر على Vercel (الموصى به)

#### الخطوة 1: إنشاء حساب Vercel

1. اذهب إلى [Vercel](https://vercel.com)
2. انقر على "Sign Up"
3. اختر "Continue with GitHub"

#### الخطوة 2: ربط المشروع

1. انقر على "New Project"
2. اختر المستودع من GitHub
3. انقر على "Import"

#### الخطوة 3: إضافة متغيرات البيئة

1. اذهب إلى Settings > Environment Variables
2. أضف جميع متغيرات `.env.local`
3. انقر على "Deploy"

#### الخطوة 4: النشر

```bash
git push origin main
```

سيتم النشر تلقائياً على Vercel.

### خيار 2: النشر على Heroku

#### الخطوة 1: تثبيت Heroku CLI

```bash
npm install -g heroku
```

#### الخطوة 2: تسجيل الدخول

```bash
heroku login
```

#### الخطوة 3: إنشاء تطبيق

```bash
heroku create your-app-name
```

#### الخطوة 4: إضافة متغيرات البيئة

```bash
heroku config:set NEXT_PUBLIC_SUPABASE_URL=your-url
heroku config:set NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
# ... أضف باقي المتغيرات
```

#### الخطوة 5: النشر

```bash
git push heroku main
```

### خيار 3: النشر على خادم خاص

#### الخطوة 1: إعداد الخادم

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# تثبيت Nginx
sudo apt install -y nginx

# تثبيت PM2
sudo npm install -g pm2
```

#### الخطوة 2: استنساخ المشروع

```bash
cd /var/www
git clone <repository-url> qms
cd qms
npm install --legacy-peer-deps
```

#### الخطوة 3: بناء المشروع

```bash
npm run build
```

#### الخطوة 4: تشغيل مع PM2

```bash
pm2 start npm --name "qms" -- start
pm2 save
pm2 startup
```

#### الخطوة 5: إعداد Nginx

أنشئ ملف `/etc/nginx/sites-available/qms`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### الخطوة 6: تفعيل الموقع

```bash
sudo ln -s /etc/nginx/sites-available/qms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### الخطوة 7: إضافة SSL (اختياري)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## التحقق من التثبيت

### 1. التحقق من الاتصال بـ Supabase

```bash
curl https://your-project.supabase.co/rest/v1/settings?select=*
```

### 2. اختبار الصفحات الرئيسية

- الصفحة الرئيسية: `http://localhost:3000`
- دخول الإدارة: `http://localhost:3000/admin/login`
- دخول الأطباء: `http://localhost:3000/doctor/login`
- شاشة العرض: `http://localhost:3000/display`

### 3. اختبار البيانات

```bash
# اختبار الاتصال بقاعدة البيانات
npm run test:db
```

---

## استكشاف الأخطاء

### المشكلة: خطأ في الاتصال بـ Supabase

**الحل:**
1. تحقق من متغيرات البيئة
2. تأكد من أن مفاتيح API صحيحة
3. تحقق من أن المشروع نشط في Supabase

### المشكلة: ملفات الصوت لا تعمل

**الحل:**
1. تأكد من وجود المجلد `public/audio`
2. تحقق من أسماء الملفات
3. تأكد من أن الملفات بصيغة MP3

### المشكلة: الصفحات لا تحمل

**الحل:**
1. امسح ذاكرة التخزين المؤقت: `npm run build`
2. أعد تشغيل الخادم
3. تحقق من سجلات الأخطاء

### المشكلة: مشاكل في الأداء

**الحل:**
1. فعّل التخزين المؤقت
2. قلل حجم الصور والفيديوهات
3. استخدم CDN للأصول الثابتة

---

## الصيانة والتحديثات

### تحديث المكتبات

```bash
npm update
npm audit fix
```

### النسخ الاحتياطية

```bash
# نسخ احتياطية من قاعدة البيانات
pg_dump -h your-host -U your-user -d your-db > backup.sql
```

### المراقبة

```bash
# مراقبة استخدام الموارد
pm2 monit

# عرض السجلات
pm2 logs qms
```

---

## الأمان

### 1. تحديث كلمات المرور

```sql
UPDATE auth.users SET encrypted_password = crypt('new_password', gen_salt('bf'))
WHERE email = 'admin@medical.com';
```

### 2. تفعيل HTTPS

```bash
# في Vercel: تلقائي
# في Heroku: تلقائي
# في خادم خاص: استخدم Certbot
```

### 3. إعدادات الأمان

```env
# في .env.local
NEXT_PUBLIC_SUPABASE_URL=https://... (استخدم HTTPS)
NODE_ENV=production
```

---

## الدعم والمساعدة

### الموارد المفيدة

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### الاتصال بالدعم

- البريد الإلكتروني: support@medical-qms.com
- الهاتف: +20 2 XXXX XXXX
- الموقع: www.medical-qms.com

---

## ملاحظات مهمة

1. **الأداء**: قد تحتاج إلى تحسين الأداء حسب عدد المستخدمين
2. **التوسع**: يمكن إضافة ميزات جديدة بسهولة
3. **الدعم**: تأكد من وجود فريق دعم فني
4. **التدريب**: قدم تدريباً للموظفين على استخدام النظام

---

## الخطوات التالية

بعد النشر بنجاح:

1. ✅ اختبر جميع الميزات
2. ✅ قدم تدريباً للموظفين
3. ✅ راقب الأداء والأخطاء
4. ✅ اجمع ملاحظات المستخدمين
5. ✅ خطط للتحديثات المستقبلية

---

**آخر تحديث**: ديسمبر 2025
**الإصدار**: 1.0.0
