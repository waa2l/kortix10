-- ============================================
-- SMART MEDICAL QUEUE MANAGEMENT SYSTEM
-- Complete Database Schema with Sample Data
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  center_name VARCHAR(255) NOT NULL DEFAULT 'مركز طبي',
  news_ticker_content TEXT DEFAULT 'أهلا وسهلا بكم في المركز الطبي',
  news_ticker_speed INT DEFAULT 30,
  alert_duration INT DEFAULT 5,
  speech_speed INT DEFAULT 1,
  daily_reset_time TIME DEFAULT '06:00:00',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. SCREENS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS screens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  screen_number INT NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. CLINICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_name VARCHAR(255) NOT NULL,
  clinic_number INT NOT NULL UNIQUE,
  screen_id UUID REFERENCES screens(id) ON DELETE SET NULL,
  control_password VARCHAR(255) NOT NULL,
  current_number INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  max_daily_appointments INT DEFAULT 50,
  morning_shift_start TIME DEFAULT '08:00:00',
  morning_shift_end TIME DEFAULT '14:00:00',
  evening_shift_start TIME DEFAULT '14:00:00',
  evening_shift_end TIME DEFAULT '20:00:00',
  last_call_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. DOCTORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_number VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  national_id VARCHAR(14) UNIQUE,
  specialization VARCHAR(255) NOT NULL,
  clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
  work_days VARCHAR(255),
  work_status VARCHAR(50) DEFAULT 'active',
  shift VARCHAR(50),
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,
  annual_leave_balance INT DEFAULT 30,
  emergency_leave_balance INT DEFAULT 10,
  absence_days INT DEFAULT 0,
  notes TEXT,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. PATIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255),
  national_id VARCHAR(14) UNIQUE,
  phone VARCHAR(20),
  email VARCHAR(255),
  gender VARCHAR(20),
  family_members_count INT,
  chronic_diseases VARCHAR(255),
  is_pregnant BOOLEAN DEFAULT false,
  is_breastfeeding BOOLEAN DEFAULT false,
  previous_surgeries BOOLEAN DEFAULT false,
  surgery_details TEXT,
  drug_allergies BOOLEAN DEFAULT false,
  allergy_details TEXT,
  current_medications BOOLEAN DEFAULT false,
  medication_details TEXT,
  mental_health_issues BOOLEAN DEFAULT false,
  mental_health_details TEXT,
  has_disability BOOLEAN DEFAULT false,
  weight_kg DECIMAL(5,2),
  height_cm DECIMAL(5,2),
  blood_pressure VARCHAR(20),
  temperature DECIMAL(4,2),
  pulse INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. QUEUE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  ticket_number INT NOT NULL,
  status VARCHAR(50) DEFAULT 'waiting',
  called_at TIMESTAMP,
  completed_at TIMESTAMP,
  is_emergency BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 7. APPOINTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  shift VARCHAR(50),
  visit_reason VARCHAR(255),
  status VARCHAR(50) DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 8. CONSULTATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_code VARCHAR(10) UNIQUE NOT NULL,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  specialization VARCHAR(255) NOT NULL,
  complaint_text TEXT NOT NULL,
  current_symptoms TEXT,
  status VARCHAR(50) DEFAULT 'open',
  response_text TEXT,
  medicines TEXT,
  tests TEXT,
  imaging TEXT,
  health_messages TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 9. COMPLAINTS & SUGGESTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_name VARCHAR(255),
  patient_phone VARCHAR(20),
  patient_email VARCHAR(255),
  complaint_type VARCHAR(50),
  complaint_text TEXT NOT NULL,
  additional_notes TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 10. DOCTOR ATTENDANCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS doctor_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,
  status VARCHAR(50) DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(doctor_id, attendance_date)
);

-- ============================================
-- 11. DOCTOR REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS doctor_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  request_type VARCHAR(100) NOT NULL,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  assigned_to VARCHAR(255),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 12. MEDICINES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS medicines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medicine_name VARCHAR(255) NOT NULL UNIQUE,
  dosage VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 13. TESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_name VARCHAR(255) NOT NULL UNIQUE,
  test_code VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 14. IMAGING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS imaging (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  imaging_name VARCHAR(255) NOT NULL UNIQUE,
  imaging_code VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 15. HEALTH MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS health_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_text TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SAMPLE DATA INSERTION
-- ============================================

-- Insert Settings
INSERT INTO settings (center_name, news_ticker_content, news_ticker_speed, alert_duration, speech_speed)
VALUES ('مركز الصحة الحديث', 'أهلا وسهلا بكم في مركز الصحة الحديث - نتمنى لكم الشفاء العاجل', 30, 5, 1)
ON CONFLICT DO NOTHING;

-- Insert Screens (5 screens)
INSERT INTO screens (screen_number, password, is_active) VALUES
(1, 'screen123', true),
(2, 'screen456', true),
(3, 'screen789', true),
(4, 'screen012', true),
(5, 'screen345', true)
ON CONFLICT DO NOTHING;

-- Insert Clinics
INSERT INTO clinics (clinic_name, clinic_number, screen_id, control_password, current_number, is_active, max_daily_appointments)
VALUES
('طب الأسرة', 1, (SELECT id FROM screens WHERE screen_number = 1), 'clinic123', 0, true, 50),
('الأطفال', 2, (SELECT id FROM screens WHERE screen_number = 1), 'clinic456', 0, true, 40),
('النساء والتوليد', 3, (SELECT id FROM screens WHERE screen_number = 2), 'clinic789', 0, true, 35),
('الأسنان', 4, (SELECT id FROM screens WHERE screen_number = 2), 'clinic012', 0, true, 30),
('العيون', 5, (SELECT id FROM screens WHERE screen_number = 3), 'clinic345', 0, true, 25),
('الجلدية', 6, (SELECT id FROM screens WHERE screen_number = 3), 'clinic678', 0, true, 30),
('الأنف والأذن والحنجرة', 7, (SELECT id FROM screens WHERE screen_number = 4), 'clinic901', 0, true, 28),
('القلب', 8, (SELECT id FROM screens WHERE screen_number = 4), 'clinic234', 0, true, 20),
('الجهاز الهضمي', 9, (SELECT id FROM screens WHERE screen_number = 5), 'clinic567', 0, true, 25),
('العظام', 10, (SELECT id FROM screens WHERE screen_number = 5), 'clinic890', 0, true, 30)
ON CONFLICT DO NOTHING;

-- Insert Doctors
INSERT INTO doctors (doctor_number, full_name, phone, national_id, specialization, clinic_id, work_days, work_status, shift, annual_leave_balance, emergency_leave_balance, email, password_hash)
VALUES
('DOC001', 'د. أحمد محمد علي', '01001234567', '29001011234567', 'طب الأسرة', (SELECT id FROM clinics WHERE clinic_number = 1), 'السبت,الأحد,الاثنين,الثلاثاء,الأربعاء', 'active', 'morning', 30, 10, 'ahmed@medical.com', '$2a$10$hash1'),
('DOC002', 'د. فاطمة أحمد محمود', '01101234567', '29501011234567', 'طب الأسرة', (SELECT id FROM clinics WHERE clinic_number = 1), 'السبت,الأحد,الاثنين,الثلاثاء,الأربعاء', 'active', 'evening', 30, 10, 'fatima@medical.com', '$2a$10$hash2'),
('DOC003', 'د. محمود حسن إبراهيم', '01201234567', '29101011234567', 'الأطفال', (SELECT id FROM clinics WHERE clinic_number = 2), 'الأحد,الاثنين,الثلاثاء,الأربعاء,الخميس', 'active', 'morning', 30, 10, 'mahmoud@medical.com', '$2a$10$hash3'),
('DOC004', 'د. نور علي محمد', '01301234567', '29601011234567', 'النساء والتوليد', (SELECT id FROM clinics WHERE clinic_number = 3), 'السبت,الأحد,الاثنين,الثلاثاء,الأربعاء', 'active', 'morning', 30, 10, 'noor@medical.com', '$2a$10$hash4'),
('DOC005', 'د. سارة محمد حسن', '01401234567', '29701011234567', 'الأسنان', (SELECT id FROM clinics WHERE clinic_number = 4), 'الأحد,الاثنين,الثلاثاء,الأربعاء,الخميس', 'active', 'morning', 30, 10, 'sarah@medical.com', '$2a$10$hash5'),
('DOC006', 'د. خالد عبدالله محمد', '01501234567', '29201011234567', 'العيون', (SELECT id FROM clinics WHERE clinic_number = 5), 'السبت,الأحد,الاثنين,الثلاثاء,الأربعاء', 'active', 'evening', 30, 10, 'khaled@medical.com', '$2a$10$hash6'),
('DOC007', 'د. ليلى إبراهيم أحمد', '01601234567', '29801011234567', 'الجلدية', (SELECT id FROM clinics WHERE clinic_number = 6), 'الأحد,الاثنين,الثلاثاء,الأربعاء,الخميس', 'active', 'morning', 30, 10, 'layla@medical.com', '$2a$10$hash7'),
('DOC008', 'د. عمر حسن علي', '01701234567', '29301011234567', 'الأنف والأذن والحنجرة', (SELECT id FROM clinics WHERE clinic_number = 7), 'السبت,الأحد,الاثنين,الثلاثاء,الأربعاء', 'active', 'morning', 30, 10, 'omar@medical.com', '$2a$10$hash8'),
('DOC009', 'د. مريم محمود حسن', '01801234567', '29901011234567', 'القلب', (SELECT id FROM clinics WHERE clinic_number = 8), 'الأحد,الاثنين,الثلاثاء,الأربعاء,الخميس', 'active', 'evening', 30, 10, 'maryam@medical.com', '$2a$10$hash9'),
('DOC010', 'د. يوسف علي محمد', '01901234567', '29401011234567', 'الجهاز الهضمي', (SELECT id FROM clinics WHERE clinic_number = 9), 'السبت,الأحد,الاثنين,الثلاثاء,الأربعاء', 'active', 'morning', 30, 10, 'youssef@medical.com', '$2a$10$hash10')
ON CONFLICT DO NOTHING;

-- Insert Patients
INSERT INTO patients (full_name, national_id, phone, email, gender, family_members_count, chronic_diseases, weight_kg, height_cm)
VALUES
('محمد أحمد علي', '29001011234567', '01001234567', 'patient1@email.com', 'ذكر', 4, 'سكر', 75.5, 175),
('فاطمة محمود حسن', '29501011234568', '01101234567', 'patient2@email.com', 'أنثى', 3, 'ضغط', 65.0, 165),
('علي محمد إبراهيم', '29101011234569', '01201234567', 'patient3@email.com', 'ذكر', 5, 'لا يوجد', 80.0, 180),
('نور علي محمد', '29601011234570', '01301234567', 'patient4@email.com', 'أنثى', 2, 'سكر,ضغط', 70.0, 170),
('سارة حسن علي', '29701011234571', '01401234567', 'patient5@email.com', 'أنثى', 4, 'لا يوجد', 62.0, 162),
('خالد عبدالله محمد', '29201011234572', '01501234567', 'patient6@email.com', 'ذكر', 3, 'ضغط', 85.0, 182),
('ليلى إبراهيم أحمد', '29801011234573', '01601234567', 'patient7@email.com', 'أنثى', 2, 'لا يوجد', 58.0, 160),
('عمر حسن علي', '29301011234574', '01701234567', 'patient8@email.com', 'ذكر', 4, 'سكر', 78.0, 178),
('مريم محمود حسن', '29901011234575', '01801234567', 'patient9@email.com', 'أنثى', 3, 'لا يوجد', 68.0, 168),
('يوسف علي محمد', '29401011234576', '01901234567', 'patient10@email.com', 'ذكر', 5, 'ضغط', 82.0, 180)
ON CONFLICT DO NOTHING;

-- Insert Medicines
INSERT INTO medicines (medicine_name, dosage) VALUES
('الأسبرين', '500 ملغ'),
('الباراسيتامول', '500 ملغ'),
('الأموكسيسيلين', '250 ملغ'),
('الإيبوبروفين', '400 ملغ'),
('الميتفورمين', '500 ملغ'),
('الليسينوبريل', '10 ملغ'),
('الأتينولول', '50 ملغ'),
('الفلوكسيتين', '20 ملغ'),
('الأوميبرازول', '20 ملغ'),
('السيميتيدين', '400 ملغ')
ON CONFLICT DO NOTHING;

-- Insert Tests
INSERT INTO tests (test_name, test_code) VALUES
('تحليل الدم الكامل', 'CBC'),
('تحليل السكر', 'GLU'),
('تحليل الكوليسترول', 'CHOL'),
('وظائف الكبد', 'LFT'),
('وظائف الكلى', 'RFT'),
('تحليل البول', 'UA'),
('تحليل الغدة الدرقية', 'TSH'),
('تحليل الدهون الثلاثية', 'TG'),
('تحليل حمض اليوريك', 'UA'),
('تحليل الهيموجلوبين', 'HB')
ON CONFLICT DO NOTHING;

-- Insert Imaging
INSERT INTO imaging (imaging_name, imaging_code) VALUES
('الأشعة السينية', 'XR'),
('الموجات فوق الصوتية', 'US'),
('التصوير المقطعي', 'CT'),
('الرنين المغناطيسي', 'MRI'),
('تصوير الثدي', 'MMG'),
('تصوير العظام', 'BS'),
('تصوير الأوعية الدموية', 'AG'),
('تصوير الدماغ', 'BR'),
('تصوير البطن', 'ABD'),
('تصوير الصدر', 'CXR')
ON CONFLICT DO NOTHING;

-- Insert Health Messages
INSERT INTO health_messages (message_text) VALUES
('شرب الماء بكثرة يساعد على الصحة'),
('ممارسة الرياضة بانتظام تحسن الصحة العامة'),
('النوم الكافي ضروري للصحة النفسية والجسدية'),
('تناول الخضروات والفواكه يقوي المناعة'),
('تجنب التدخين والكحول يحافظ على الصحة'),
('الفحوصات الدورية تساعد في الكشف المبكر عن الأمراض'),
('الإجهاد يؤثر سلبا على الصحة'),
('الغذاء الصحي المتوازن ضروري للجسم'),
('المشي اليومي يحسن صحة القلب'),
('الاسترخاء والتأمل يقللان التوتر')
ON CONFLICT DO NOTHING;

-- Insert Sample Appointments
INSERT INTO appointments (patient_id, clinic_id, doctor_id, appointment_date, appointment_time, shift, visit_reason, status)
SELECT 
  p.id,
  c.id,
  d.id,
  CURRENT_DATE + INTERVAL '1 day',
  '09:00:00',
  'morning',
  'فحص عام',
  'scheduled'
FROM patients p
CROSS JOIN clinics c
CROSS JOIN doctors d
WHERE p.national_id = '29001011234567' AND c.clinic_number = 1 AND d.doctor_number = 'DOC001'
ON CONFLICT DO NOTHING;

-- Insert Sample Consultations
INSERT INTO consultations (consultation_code, patient_id, doctor_id, specialization, complaint_text, current_symptoms, status)
SELECT
  'A' || LPAD(CAST(ROW_NUMBER() OVER (ORDER BY p.id) AS VARCHAR), 3, '0'),
  p.id,
  d.id,
  'طب الأسرة',
  'أعاني من آلام في الرأس',
  'صداع مستمر',
  'open'
FROM patients p
CROSS JOIN doctors d
WHERE d.doctor_number = 'DOC001'
LIMIT 5
ON CONFLICT DO NOTHING;

-- Insert Sample Queue
INSERT INTO queue (clinic_id, patient_id, ticket_number, status)
SELECT
  c.id,
  p.id,
  ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY p.id),
  'waiting'
FROM clinics c
CROSS JOIN patients p
WHERE c.clinic_number = 1
LIMIT 5
ON CONFLICT DO NOTHING;

-- ============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_queue_clinic_id ON queue(clinic_id);
CREATE INDEX IF NOT EXISTS idx_queue_patient_id ON queue(patient_id);
CREATE INDEX IF NOT EXISTS idx_queue_status ON queue(status);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_doctor_attendance_doctor_id ON doctor_attendance(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_attendance_date ON doctor_attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_doctor_requests_doctor_id ON doctor_requests(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_requests_status ON doctor_requests(status);
CREATE INDEX IF NOT EXISTS idx_patients_national_id ON patients(national_id);
CREATE INDEX IF NOT EXISTS idx_doctors_email ON doctors(email);
CREATE INDEX IF NOT EXISTS idx_clinics_number ON clinics(clinic_number);

-- ============================================
-- CREATE VIEWS FOR COMMON QUERIES
-- ============================================
CREATE OR REPLACE VIEW clinic_queue_status AS
SELECT 
  c.id,
  c.clinic_name,
  c.clinic_number,
  c.current_number,
  c.is_active,
  COUNT(q.id) as waiting_count,
  MAX(q.created_at) as last_call_time
FROM clinics c
LEFT JOIN queue q ON c.id = q.clinic_id AND q.status = 'waiting'
GROUP BY c.id, c.clinic_name, c.clinic_number, c.current_number, c.is_active;

CREATE OR REPLACE VIEW doctor_schedule AS
SELECT 
  d.id,
  d.full_name,
  d.specialization,
  c.clinic_name,
  d.work_days,
  d.shift,
  COUNT(a.id) as appointments_today
FROM doctors d
LEFT JOIN clinics c ON d.clinic_id = c.id
LEFT JOIN appointments a ON d.id = a.doctor_id AND a.appointment_date = CURRENT_DATE
GROUP BY d.id, d.full_name, d.specialization, c.clinic_name, d.work_days, d.shift;

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE screens ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for now, restrict in production)
CREATE POLICY "Allow all access to settings" ON settings FOR ALL USING (true);
CREATE POLICY "Allow all access to screens" ON screens FOR ALL USING (true);
CREATE POLICY "Allow all access to clinics" ON clinics FOR ALL USING (true);
CREATE POLICY "Allow all access to doctors" ON doctors FOR ALL USING (true);
CREATE POLICY "Allow all access to patients" ON patients FOR ALL USING (true);
CREATE POLICY "Allow all access to queue" ON queue FOR ALL USING (true);
CREATE POLICY "Allow all access to appointments" ON appointments FOR ALL USING (true);
CREATE POLICY "Allow all access to consultations" ON consultations FOR ALL USING (true);
CREATE POLICY "Allow all access to complaints" ON complaints FOR ALL USING (true);
CREATE POLICY "Allow all access to doctor_attendance" ON doctor_attendance FOR ALL USING (true);
CREATE POLICY "Allow all access to doctor_requests" ON doctor_requests FOR ALL USING (true);
