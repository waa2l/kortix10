// Type Definitions for the Application

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient';
  created_at: string;
}

// التعديل الضروري هنا 👇
export interface Doctor {
  id: string;
  doctor_number: string;
  full_name: string;
  phone?: string;
  national_id?: string;
  specialization: string;
  clinic_id?: string;
  work_days?: string;
  work_status?: string;
  shift?: string;
  check_in_time?: string;
  check_out_time?: string;
  annual_leave_balance?: number;
  emergency_leave_balance?: number;
  absence_days?: number;
  notes?: string;
  email?: string;
  image_url?: string; // <--- هذا السطر هو حل المشكلة (علامة ؟ تعني أنه اختياري)
  code?: string;      // وهذا أيضاً مطلوب لتسجيل الدخول
  created_at: string;
  updated_at: string;
}

export interface AdminSession {
  user: User;
  token: string;
  expires_at: string;
}

export interface DoctorSession {
  user: User;
  doctor_id: string;
  token: string;
  expires_at: string;
}

export interface QueueItem {
  id: string;
  clinic_id: string;
  patient_id?: string;
  ticket_number: number;
  status: 'waiting' | 'called' | 'completed' | 'cancelled';
  called_at?: string;
  completed_at?: string;
  is_emergency: boolean;
  created_at: string;
  updated_at: string;
}

export interface CallNotification {
  id: string;
  clinic_id: string;
  patient_number: number;
  clinic_name: string;
  message: string;
  timestamp: string;
  duration: number;
}

export interface AudioFile {
  id: string;
  name: string;
  path: string;
  type: 'number' | 'clinic' | 'instant' | 'custom';
  duration: number;
}

export interface ConsultationResponse {
  medicines?: string[];
  tests?: string[];
  imaging?: string[];
  health_messages?: string[];
  notes?: string;
}

export interface AppointmentSlot {
  time: string;
  available: boolean;
  doctor_id?: string;
}

export interface DailySchedule {
  date: string;
  morning_slots: AppointmentSlot[];
  evening_slots: AppointmentSlot[];
}

export interface LeaveRequest {
  id: string;
  doctor_id: string;
  request_type: string;
  from_date: string;
  to_date: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  doctor_id: string;
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  status: 'present' | 'absent' | 'late' | 'early_leave';
  notes?: string;
}

export interface MedicalRecord {
  patient_id: string;
  weight?: number;
  height?: number;
  blood_pressure?: string;
  temperature?: number;
  pulse?: number;
  chronic_diseases?: string[];
  allergies?: string[];
  medications?: string[];
  surgeries?: string[];
}

export interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  whatsapp_notifications: boolean;
  push_notifications: boolean;
}

export interface SystemSettings {
  center_name: string;
  news_ticker_content: string;
  news_ticker_speed: number;
  alert_duration: number;
  speech_speed: number;
  daily_reset_time: string;
  max_screens: number;
  max_clinics: number;
}

export interface ClinicStats {
  clinic_id: string;
  clinic_name: string;
  total_patients_today: number;
  current_number: number;
  average_wait_time: number;
  completed_patients: number;
  pending_patients: number;
}

export interface DoctorStats {
  doctor_id: string;
  doctor_name: string;
  total_consultations: number;
  open_consultations: number;
  closed_consultations: number;
  average_response_time: number;
  attendance_rate: number;
}

export interface SystemStats {
  total_patients: number;
  total_doctors: number;
  total_clinics: number;
  total_appointments: number;
  total_consultations: number;
  average_wait_time: number;
  system_uptime: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
  code: string;
  timestamp: string;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface FilterOptions {
  search?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  clinic_id?: string;
  doctor_id?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  include_fields: string[];
  date_range?: {
    from: string;
    to: string;
  };
}

export interface ReportData {
  title: string;
  generated_at: string;
  period: {
    from: string;
    to: string;
  };
  data: any[];
  summary: {
    total_records: number;
    total_pages: number;
  };
}
