// Audio Utilities
export const audioPath = '/audio';

export const getAudioFile = (type: 'number' | 'clinic' | 'instant', value: number | string): string => {
  switch (type) {
    case 'number':
      return `${audioPath}/${value}.mp3`;
    case 'clinic':
      return `${audioPath}/clinic${value}.mp3`;
    case 'instant':
      return `${audioPath}/instant${value}.mp3`;
    default:
      return '';
  }
};

export const playAudio = async (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio(src);
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error(`Failed to play audio: ${src}`));
    audio.play().catch(reject);
  });
};

export const playSequentialAudio = async (files: string[]): Promise<void> => {
  for (const file of files) {
    await playAudio(file);
  }
};

export const speakArabic = async (text: string, rate: number = 1): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = rate;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => resolve();
      utterance.onerror = () => reject(new Error('Speech synthesis failed'));
      window.speechSynthesis.speak(utterance);
    } else {
      reject(new Error('Speech synthesis not supported'));
    }
  });
};

// Date Utilities
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatTime = (time: string | Date): string => {
  if (typeof time === 'string') {
    return time.substring(0, 5);
  }
  return `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
};

export const formatDateTime = (dateTime: string | Date): string => {
  const d = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
  return `${formatDate(d)} ${formatTime(d)}`;
};

export const getArabicDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const arabicDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const arabicMonths = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const day = arabicDays[d.getDay()];
  const date_num = d.getDate();
  const month = arabicMonths[d.getMonth()];
  const year = d.getFullYear();

  return `${day} ${date_num} ${month} ${year}`;
};

export const getArabicTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Number Utilities
export const toArabicNumbers = (num: number | string): string => {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).replace(/\d/g, (digit) => arabicNumbers[parseInt(digit)]);
};

export const fromArabicNumbers = (text: string): string => {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let result = text;
  arabicNumbers.forEach((arabic, index) => {
    result = result.replace(new RegExp(arabic, 'g'), String(index));
  });
  return result;
};

// Validation Utilities
export const isValidNationalId = (id: string): boolean => {
  return /^\d{14}$/.test(id);
};

export const isValidPhone = (phone: string): boolean => {
  return /^01[0-2]\d{8}$/.test(phone);
};

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Medical Utilities
export const calculateBMI = (weight: number, height: number): number => {
  // height in cm, convert to meters
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'نقص الوزن';
  if (bmi < 25) return 'وزن طبيعي';
  if (bmi < 30) return 'زيادة الوزن';
  return 'السمنة';
};

export const calculateIdealWeight = (height: number, gender: 'ذكر' | 'أنثى'): number => {
  // Devine formula
  const heightInInches = height / 2.54;
  if (gender === 'ذكر') {
    return 50 + (2.3 * (heightInInches - 60));
  } else {
    return 45.5 + (2.3 * (heightInInches - 60));
  }
};

export const calculateOvulationDate = (lastPeriodDate: Date): Date => {
  const ovulationDate = new Date(lastPeriodDate);
  ovulationDate.setDate(ovulationDate.getDate() + 14);
  return ovulationDate;
};

export const calculateDueDate = (lastPeriodDate: Date): Date => {
  const dueDate = new Date(lastPeriodDate);
  dueDate.setDate(dueDate.getDate() + 280); // 40 weeks
  return dueDate;
};

export const calculatePregnancyWeek = (lastPeriodDate: Date): number => {
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - lastPeriodDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7);
};

// String Utilities
export const truncateText = (text: string, length: number): string => {
  return text.length > length ? `${text.substring(0, length)}...` : text;
};

export const generateConsultationCode = (): string => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letter = letters.charAt(Math.floor(Math.random() * letters.length));
  const numbers = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `${letter}${numbers}`;
};

export const generateTicketNumber = (): number => {
  return Math.floor(Math.random() * 1000) + 1;
};

// Cache Utilities
export const cacheAsset = async (url: string): Promise<void> => {
  if ('caches' in window) {
    try {
      const cache = await caches.open('qms-assets-v1');
      const response = await fetch(url);
      await cache.put(url, response);
    } catch (error) {
      console.error('Cache error:', error);
    }
  }
};

export const getCachedAsset = async (url: string): Promise<Response | undefined> => {
  if ('caches' in window) {
    try {
      const cache = await caches.open('qms-assets-v1');
      return await cache.match(url);
    } catch (error) {
      console.error('Cache error:', error);
    }
  }
};

// Local Storage Utilities
export const setLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('LocalStorage error:', error);
  }
};

export const getLocalStorage = (key: string): any => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('LocalStorage error:', error);
    return null;
  }
};

export const removeLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('LocalStorage error:', error);
  }
};

// QR Code Utilities
export const generateQRCodeData = (clinicId: string): string => {
  return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/patient?clinic=${clinicId}`;
};

// Print Utilities
export const printElement = (elementId: string): void => {
  const element = document.getElementById(elementId);
  if (element) {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write(element.innerHTML);
      printWindow.document.close();
      printWindow.print();
    }
  }
};

// Error Handling
export const handleError = (error: any): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'حدث خطأ غير متوقع';
};
