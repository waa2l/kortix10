// Application Constants

export const APP_NAME = 'Smart Medical Queue Management System';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'نظام إدارة الطوابير الطبية الذكي';

// API Endpoints
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Audio Settings
export const AUDIO_PATH = process.env.NEXT_PUBLIC_AUDIO_PATH || '/audio';
export const SPEECH_RATE = parseFloat(process.env.NEXT_PUBLIC_SPEECH_RATE || '1');

// Supabase
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Time Constants
export const ALERT_DURATION = 5000; // 5 seconds
export const NEWS_TICKER_SPEED = 30; // seconds
export const DOCTOR_PHOTO_DURATION = 10000; // 10 seconds

// Queue Settings
export const MAX_QUEUE_NUMBER = 999;
export const MIN_QUEUE_NUMBER = 1;

// Appointment Settings
export const MORNING_SHIFT_START = '08:00';
export const MORNING_SHIFT_END = '14:00';
export const EVENING_SHIFT_START = '14:00';
export const EVENING_SHIFT_END = '20:00';

// Validation Rules
export const NATIONAL_ID_LENGTH = 14;
export const PHONE_LENGTH = 11;
export const MIN_NAME_LENGTH = 3;
export const MAX_NAME_LENGTH = 50;
export const MIN_COMPLAINT_LENGTH = 10;
export const MAX_COMPLAINT_LENGTH = 500;

// Request Types
export const REQUEST_TYPES = [
  'اجازة اعتيادية',
  'اجازة عارضة',
  'بدل راحة',
  'مأمورية',
  'اذن صباحى',
  'اذن مسائى',
  'مامورية تدريب',
  'اجازة مرضى',
  'تامين صحى',
  'خط سير',
  'أخرى',
];

// Specializations
export const SPECIALIZATIONS = [
  'طب الأسرة',
  'الأطفال',
  'النساء والتوليد',
  'الأسنان',
  'العيون',
  'الجلدية',
  'الأنف والأذن والحنجرة',
  'القلب',
  'الجهاز الهضمي',
  'العظام',
];

// Chronic Diseases
export const CHRONIC_DISEASES = [
  'سكر',
  'ضغط',
  'أورام',
  'كبد',
  'كلى',
  'أخرى',
];

// Gender Options
export const GENDER_OPTIONS = [
  'ذكر',
  'أنثى',
  'طفل',
];

// Status Options
export const STATUS_OPTIONS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Complaint Types
export const COMPLAINT_TYPES = [
  'شكوى',
  'اقتراح',
];

// Colors
export const COLORS = {
  PRIMARY: '#1e40af',
  SECONDARY: '#7c3aed',
  SUCCESS: '#10b981',
  DANGER: '#ef4444',
  WARNING: '#f59e0b',
  INFO: '#3b82f6',
};

// Messages
export const MESSAGES = {
  SUCCESS: 'تم بنجاح',
  ERROR: 'حدث خطأ',
  LOADING: 'جاري التحميل...',
  CONFIRM: 'هل أنت متأكد؟',
  SAVED: 'تم الحفظ بنجاح',
  DELETED: 'تم الحذف بنجاح',
  UPDATED: 'تم التحديث بنجاح',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  ADMIN_SESSION: 'adminSession',
  DOCTOR_SESSION: 'doctorSession',
  PATIENT_SESSION: 'patientSession',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Cache Duration (in milliseconds)
export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 60 * 60 * 1000, // 1 hour
}