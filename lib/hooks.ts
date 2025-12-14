'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
import type {
  Settings,
  Clinic,
  Doctor,
  Patient,
  Queue,
  Appointment,
  Consultation,
  Complaint,
  DoctorAttendance,
  DoctorRequest,
  Medicine,
  Test,
  Imaging,
  HealthMessage,
} from './supabase';

// Settings Hooks
export const useSettings = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .single();

        if (error) throw error;
        setSettings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateSettings = useCallback(async (updates: Partial<Settings>) => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .update(updates)
        .eq('id', settings?.id)
        .select()
        .single();

      if (error) throw error;
      setSettings(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating settings';
      setError(message);
      throw err;
    }
  }, [settings?.id]);

  return { settings, loading, error, updateSettings };
};

// Clinics Hooks
export const useClinics = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const { data, error } = await supabase
          .from('clinics')
          .select('*')
          .order('clinic_number');

        if (error) throw error;
        setClinics(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching clinics');
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();

    // Subscribe to realtime updates
    const subscription = supabase
      .channel('clinics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clinics' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setClinics((prev) => [...prev, payload.new as Clinic]);
        } else if (payload.eventType === 'UPDATE') {
          setClinics((prev) =>
            prev.map((c) => (c.id === payload.new.id ? (payload.new as Clinic) : c))
          );
        } else if (payload.eventType === 'DELETE') {
          setClinics((prev) => prev.filter((c) => c.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addClinic = useCallback(async (clinic: Omit<Clinic, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .insert([clinic])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  }, []);

  const updateClinic = useCallback(async (id: string, updates: Partial<Clinic>) => {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  }, []);

  const deleteClinic = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('clinics').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      throw err;
    }
  }, []);

  return { clinics, loading, error, addClinic, updateClinic, deleteClinic };
};

// Queue Hooks
export const useQueue = (clinicId?: string) => {
  const [queue, setQueue] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        let query = supabase.from('queue').select('*');

        if (clinicId) {
          query = query.eq('clinic_id', clinicId);
        }

        const { data, error } = await query.order('ticket_number');

        if (error) throw error;
        setQueue(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching queue');
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();

    // Subscribe to realtime updates
    const subscription = supabase
      .channel(`queue${clinicId ? `-${clinicId}` : ''}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue' }, (payload) => {
        if (clinicId && payload.new?.clinic_id !== clinicId) return;

        if (payload.eventType === 'INSERT') {
          setQueue((prev) => [...prev, payload.new as Queue].sort((a, b) => a.ticket_number - b.ticket_number));
        } else if (payload.eventType === 'UPDATE') {
          setQueue((prev) =>
            prev.map((q) => (q.id === payload.new.id ? (payload.new as Queue) : q))
          );
        } else if (payload.eventType === 'DELETE') {
          setQueue((prev) => prev.filter((q) => q.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [clinicId]);

  const addToQueue = useCallback(async (queueItem: Omit<Queue, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('queue')
        .insert([queueItem])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  }, []);

  const updateQueue = useCallback(async (id: string, updates: Partial<Queue>) => {
    try {
      const { data, error } = await supabase
        .from('queue')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  }, []);

  return { queue, loading, error, addToQueue, updateQueue };
};

// Doctors Hooks
export const useDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('*')
          .order('full_name');

        if (error) throw error;
        setDoctors(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching doctors');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return { doctors, loading, error };
};

// Patients Hooks
export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPatients(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const addPatient = useCallback(async (patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert([patient])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  }, []);

  return { patients, loading, error, addPatient };
};

// Appointments Hooks
export const useAppointments = (clinicId?: string, date?: string) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        let query = supabase.from('appointments').select('*');

        if (clinicId) {
          query = query.eq('clinic_id', clinicId);
        }

        if (date) {
          query = query.eq('appointment_date', date);
        }

        const { data, error } = await query.order('appointment_time');

        if (error) throw error;
        setAppointments(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [clinicId, date]);

  const addAppointment = useCallback(async (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointment])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  }, []);

  return { appointments, loading, error, addAppointment };
};

// Consultations Hooks
export const useConsultations = (doctorId?: string) => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        let query = supabase.from('consultations').select('*');

        if (doctorId) {
          query = query.eq('doctor_id', doctorId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        setConsultations(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching consultations');
      } finally {
        setLoading(false);
      }
    };

    fetchConsultations();
  }, [doctorId]);

  return { consultations, loading, error };
};

// Medicines Hooks
export const useMedicines = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const { data } = await supabase
          .from('medicines')
          .select('*')
          .order('medicine_name');

        setMedicines(data || []);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  return { medicines, loading };
};

// Tests Hooks
export const useTests = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const { data } = await supabase
          .from('tests')
          .select('*')
          .order('test_name');

        setTests(data || []);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  return { tests, loading };
};

// Imaging Hooks
export const useImaging = () => {
  const [imaging, setImaging] = useState<Imaging[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImaging = async () => {
      try {
        const { data } = await supabase
          .from('imaging')
          .select('*')
          .order('imaging_name');

        setImaging(data || []);
      } finally {
        setLoading(false);
      }
    };

    fetchImaging();
  }, []);

  return { imaging, loading };
};

// Health Messages Hooks
export const useHealthMessages = () => {
  const [messages, setMessages] = useState<HealthMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await supabase
          .from('health_messages')
          .select('*')
          .order('created_at');

        setMessages(data || []);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  return { messages, loading };
};
