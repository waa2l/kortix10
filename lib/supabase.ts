import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Settings {
  id: string;
  center_name: string;
  news_ticker_content: string;
  news_ticker_speed: number;
  alert_duration: number;
  speech_speed: number;
  daily_reset_time: string;
  created_at: string;
  updated_at: string;
}

export interface Screen {
  id: string;
  screen_number: number;
  password: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Clinic {
  id: string;
  clinic_name: string;
  clinic_number: number;
  screen_id: string | null;
  control_password: string;
  current_number: number;
  is_active: boolean;
  max_daily_appointments: number;
  morning_shift_start: string;
  morning_shift_end: string;
  evening_shift_start: string;
  evening_shift_end: string;
  last_call_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: string;
  doctor_number: string;
  full_name: string;
  phone: string | null;
  national_id: string | null;
  specialization: string;
  clinic_id: string | null;
  work_days: string | null;
  work_status: string;
  shift: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  annual_leave_balance: number;
  emergency_leave_balance: number;
  absence_days: number;
  notes: string | null;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  full_name: string | null;
  national_id: string;
  phone: string | null;
  email: string | null;
  gender: string | null;
  family_members_count: number | null;
  chronic_diseases: string | null;
  is_pregnant: boolean;
  is_breastfeeding: boolean;
  previous_surgeries: boolean;
  surgery_details: string | null;
  drug_allergies: boolean;
  allergy_details: string | null;
  current_medications: boolean;
  medication_details: string | null;
  mental_health_issues: boolean;
  mental_health_details: string | null;
  has_disability: boolean;
  weight_kg: number | null;
  height_cm: number | null;
  blood_pressure: string | null;
  temperature: number | null;
  pulse: number | null;
  created_at: string;
  updated_at: string;
}

export interface Queue {
  id: string;
  clinic_id: string;
  patient_id: string | null;
  ticket_number: number;
  status: string;
  called_at: string | null;
  completed_at: string | null;
  is_emergency: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  clinic_id: string;
  doctor_id: string | null;
  appointment_date: string;
  appointment_time: string;
  shift: string | null;
  visit_reason: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Consultation {
  id: string;
  consultation_code: string;
  patient_id: string;
  doctor_id: string | null;
  specialization: string;
  complaint_text: string;
  current_symptoms: string | null;
  status: string;
  response_text: string | null;
  medicines: string | null;
  tests: string | null;
  imaging: string | null;
  health_messages: string | null;
  created_at: string;
  updated_at: string;
}

export interface Complaint {
  id: string;
  patient_name: string | null;
  patient_phone: string | null;
  patient_email: string | null;
  complaint_type: string;
  complaint_text: string;
  additional_notes: string | null;
  status: string;
  response: string | null;
  created_at: string;
  updated_at: string;
}

export interface DoctorAttendance {
  id: string;
  doctor_id: string;
  attendance_date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DoctorRequest {
  id: string;
  doctor_id: string;
  request_type: string;
  from_date: string;
  to_date: string;
  assigned_to: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Medicine {
  id: string;
  medicine_name: string;
  dosage: string | null;
  created_at: string;
}

export interface Test {
  id: string;
  test_name: string;
  test_code: string | null;
  created_at: string;
}

export interface Imaging {
  id: string;
  imaging_name: string;
  imaging_code: string | null;
  created_at: string;
}

export interface HealthMessage {
  id: string;
  message_text: string;
  created_at: string;
}
