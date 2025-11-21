export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      admin_face_descriptors: {
        Row: {
          admin_username: string
          created_at: string | null
          face_descriptors: Json
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          admin_username: string
          created_at?: string | null
          face_descriptors: Json
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          admin_username?: string
          created_at?: string | null
          face_descriptors?: Json
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message: string
          title: string
          type: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      admin_security_settings: {
        Row: {
          admin_username: string
          created_at: string | null
          face_detection_enabled: boolean | null
          id: string
          updated_at: string | null
        }
        Insert: {
          admin_username: string
          created_at?: string | null
          face_detection_enabled?: boolean | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          admin_username?: string
          created_at?: string | null
          face_detection_enabled?: boolean | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          id: string
          password: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          password: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          password?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          created_at: string
          doctor_id: string
          id: string
          meeting_address: string | null
          meeting_link: string | null
          meeting_type: string | null
          notes: string | null
          patient_age: number | null
          patient_email: string | null
          patient_id: string | null
          patient_name: string | null
          patient_phone: string | null
          reason: string
          status: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          created_at?: string
          doctor_id: string
          id?: string
          meeting_address?: string | null
          meeting_link?: string | null
          meeting_type?: string | null
          notes?: string | null
          patient_age?: number | null
          patient_email?: string | null
          patient_id?: string | null
          patient_name?: string | null
          patient_phone?: string | null
          reason: string
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          created_at?: string
          doctor_id?: string
          id?: string
          meeting_address?: string | null
          meeting_link?: string | null
          meeting_type?: string | null
          notes?: string | null
          patient_age?: number | null
          patient_email?: string | null
          patient_id?: string | null
          patient_name?: string | null
          patient_phone?: string | null
          reason?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bed_bookings: {
        Row: {
          admission_status: string
          booking_id: string
          created_at: string
          disease: string
          id: string
          is_emergency: boolean
          medical_report_url: string | null
          patient_age: number
          patient_gender: string
          patient_name: string
          patient_user_id: string
          payment_status: string
          preferred_bed_type: string
          updated_at: string
        }
        Insert: {
          admission_status?: string
          booking_id: string
          created_at?: string
          disease: string
          id?: string
          is_emergency?: boolean
          medical_report_url?: string | null
          patient_age: number
          patient_gender: string
          patient_name: string
          patient_user_id: string
          payment_status?: string
          preferred_bed_type: string
          updated_at?: string
        }
        Update: {
          admission_status?: string
          booking_id?: string
          created_at?: string
          disease?: string
          id?: string
          is_emergency?: boolean
          medical_report_url?: string | null
          patient_age?: number
          patient_gender?: string
          patient_name?: string
          patient_user_id?: string
          payment_status?: string
          preferred_bed_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      blood_donors: {
        Row: {
          aadhar_number: string
          address: string
          admin_response: string | null
          age: number
          blood_group: string
          clerk_user_id: string | null
          created_at: string
          id: string
          is_approved: boolean
          mobile_number: string
          name: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          aadhar_number: string
          address: string
          admin_response?: string | null
          age: number
          blood_group: string
          clerk_user_id?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          mobile_number: string
          name: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          aadhar_number?: string
          address?: string
          admin_response?: string | null
          age?: number
          blood_group?: string
          clerk_user_id?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          mobile_number?: string
          name?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      blood_requests: {
        Row: {
          aadhar_number: string
          address: string
          admin_response: string | null
          blood_group: string
          clerk_user_id: string | null
          created_at: string
          delivery_instructions: string | null
          emergency_level: string
          full_name: string
          id: string
          phone_number: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          aadhar_number: string
          address: string
          admin_response?: string | null
          blood_group: string
          clerk_user_id?: string | null
          created_at?: string
          delivery_instructions?: string | null
          emergency_level: string
          full_name: string
          id?: string
          phone_number: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          aadhar_number?: string
          address?: string
          admin_response?: string | null
          blood_group?: string
          clerk_user_id?: string | null
          created_at?: string
          delivery_instructions?: string | null
          emergency_level?: string
          full_name?: string
          id?: string
          phone_number?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          clerk_user_id: string | null
          created_at: string
          id: string
          medicine_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          cart_id: string
          clerk_user_id?: string | null
          created_at?: string
          id?: string
          medicine_id: string
          quantity?: number
          updated_at?: string
        }
        Update: {
          cart_id?: string
          clerk_user_id?: string | null
          created_at?: string
          id?: string
          medicine_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          clerk_user_id: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          clerk_user_id?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          clerk_user_id?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      content_pages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_published: boolean | null
          meta_description: string | null
          page_key: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          page_key: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_published?: boolean | null
          meta_description?: string | null
          page_key?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_task_completions: {
        Row: {
          completion_date: string | null
          created_at: string
          day_number: number
          id: string
          is_completed: boolean
          notes: string | null
          patient_progress_id: string | null
          task_id: string | null
        }
        Insert: {
          completion_date?: string | null
          created_at?: string
          day_number: number
          id?: string
          is_completed?: boolean
          notes?: string | null
          patient_progress_id?: string | null
          task_id?: string | null
        }
        Update: {
          completion_date?: string | null
          created_at?: string
          day_number?: number
          id?: string
          is_completed?: boolean
          notes?: string | null
          patient_progress_id?: string | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_task_completions_patient_progress_id_fkey"
            columns: ["patient_progress_id"]
            isOneToOne: false
            referencedRelation: "patient_recovery_progress"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_task_completions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "recovery_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_profiles: {
        Row: {
          availability: string | null
          availability_message: string | null
          availability_status: string
          bio: string | null
          clerk_user_id: string | null
          clinic_name: string
          consultation_fee: number | null
          created_at: string
          degree: string | null
          doctor_name: string | null
          email: string | null
          fee_range: string | null
          hospital_name: string | null
          id: string
          is_approved: boolean | null
          is_available: boolean
          last_availability_update: string | null
          location: string | null
          medical_license: string | null
          phone: string | null
          photo_url: string | null
          profile_image_url: string | null
          rating: number | null
          specialization: string
          updated_at: string
          years_experience: number | null
          years_of_experience: number
        }
        Insert: {
          availability?: string | null
          availability_message?: string | null
          availability_status?: string
          bio?: string | null
          clerk_user_id?: string | null
          clinic_name: string
          consultation_fee?: number | null
          created_at?: string
          degree?: string | null
          doctor_name?: string | null
          email?: string | null
          fee_range?: string | null
          hospital_name?: string | null
          id: string
          is_approved?: boolean | null
          is_available?: boolean
          last_availability_update?: string | null
          location?: string | null
          medical_license?: string | null
          phone?: string | null
          photo_url?: string | null
          profile_image_url?: string | null
          rating?: number | null
          specialization: string
          updated_at?: string
          years_experience?: number | null
          years_of_experience: number
        }
        Update: {
          availability?: string | null
          availability_message?: string | null
          availability_status?: string
          bio?: string | null
          clerk_user_id?: string | null
          clinic_name?: string
          consultation_fee?: number | null
          created_at?: string
          degree?: string | null
          doctor_name?: string | null
          email?: string | null
          fee_range?: string | null
          hospital_name?: string | null
          id?: string
          is_approved?: boolean | null
          is_available?: boolean
          last_availability_update?: string | null
          location?: string | null
          medical_license?: string | null
          phone?: string | null
          photo_url?: string | null
          profile_image_url?: string | null
          rating?: number | null
          specialization?: string
          updated_at?: string
          years_experience?: number | null
          years_of_experience?: number
        }
        Relationships: []
      }
      doctor_verification_requests: {
        Row: {
          clerk_user_id: string
          created_at: string
          email: string
          full_name: string
          hospital_affiliation: string | null
          id: string
          medical_license: string
          notes: string | null
          phone: string | null
          photo_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          specialization: string
          status: string
          submitted_at: string
          updated_at: string
          years_experience: number
        }
        Insert: {
          clerk_user_id: string
          created_at?: string
          email: string
          full_name: string
          hospital_affiliation?: string | null
          id?: string
          medical_license: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          specialization: string
          status?: string
          submitted_at?: string
          updated_at?: string
          years_experience: number
        }
        Update: {
          clerk_user_id?: string
          created_at?: string
          email?: string
          full_name?: string
          hospital_affiliation?: string | null
          id?: string
          medical_license?: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          specialization?: string
          status?: string
          submitted_at?: string
          updated_at?: string
          years_experience?: number
        }
        Relationships: []
      }
      ehr_audit_logs: {
        Row: {
          action: string
          created_at: string
          doctor_id: string
          id: string
          mobile_number: string
          patient_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          doctor_id: string
          id?: string
          mobile_number: string
          patient_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          doctor_id?: string
          id?: string
          mobile_number?: string
          patient_id?: string | null
        }
        Relationships: []
      }
      emergency_health_records: {
        Row: {
          allergies: string | null
          blood_group: string | null
          chronic_diseases: string | null
          created_at: string
          current_medications: string | null
          emergency_contacts: Json | null
          full_name: string
          id: string
          is_organ_donor: boolean | null
          mobile_number: string
          patient_id: string | null
          updated_at: string
        }
        Insert: {
          allergies?: string | null
          blood_group?: string | null
          chronic_diseases?: string | null
          created_at?: string
          current_medications?: string | null
          emergency_contacts?: Json | null
          full_name: string
          id?: string
          is_organ_donor?: boolean | null
          mobile_number: string
          patient_id?: string | null
          updated_at?: string
        }
        Update: {
          allergies?: string | null
          blood_group?: string | null
          chronic_diseases?: string | null
          created_at?: string
          current_medications?: string | null
          emergency_contacts?: Json | null
          full_name?: string
          id?: string
          is_organ_donor?: boolean | null
          mobile_number?: string
          patient_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hospital_beds: {
        Row: {
          available_beds: number
          bed_type: string
          created_at: string
          id: string
          total_beds: number
          updated_at: string
        }
        Insert: {
          available_beds?: number
          bed_type: string
          created_at?: string
          id?: string
          total_beds?: number
          updated_at?: string
        }
        Update: {
          available_beds?: number
          bed_type?: string
          created_at?: string
          id?: string
          total_beds?: number
          updated_at?: string
        }
        Relationships: []
      }
      medicines: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          stock: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          stock?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          admin_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_theater: {
        Row: {
          created_at: string
          id: string
          is_available: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_available?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_available?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          medicine_id: string
          order_id: string
          price: number
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          medicine_id: string
          order_id: string
          price: number
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          medicine_id?: string
          order_id?: string
          price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          created_at: string
          id: string
          order_id: string
          status: string
          status_message: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          status: string
          status_message?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          status?: string
          status_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          created_at: string
          estimated_delivery: string | null
          id: string
          phone: string
          phone_number: string
          prescription_url: string | null
          status: string
          total_price: number
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          estimated_delivery?: string | null
          id?: string
          phone: string
          phone_number?: string
          prescription_url?: string | null
          status?: string
          total_price: number
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          estimated_delivery?: string | null
          id?: string
          phone?: string
          phone_number?: string
          prescription_url?: string | null
          status?: string
          total_price?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      patient_profiles: {
        Row: {
          allergies: string | null
          blood_group: string | null
          created_at: string
          date_of_birth: string | null
          emergency_contact: string | null
          id: string
          medical_history: string | null
          updated_at: string
        }
        Insert: {
          allergies?: string | null
          blood_group?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact?: string | null
          id: string
          medical_history?: string | null
          updated_at?: string
        }
        Update: {
          allergies?: string | null
          blood_group?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact?: string | null
          id?: string
          medical_history?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_recovery_progress: {
        Row: {
          created_at: string
          current_day: number
          id: string
          patient_id: string
          program_id: string | null
          surgery_date: string
          total_completion_percentage: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_day?: number
          id?: string
          patient_id: string
          program_id?: string | null
          surgery_date: string
          total_completion_percentage?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_day?: number
          id?: string
          patient_id?: string
          program_id?: string | null
          surgery_date?: string
          total_completion_percentage?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_recovery_progress_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "recovery_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      pregnancy_chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          message_type: string
          patient_id: string
          sender_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          message_type?: string
          patient_id: string
          sender_type: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          message_type?: string
          patient_id?: string
          sender_type?: string
        }
        Relationships: []
      }
      pregnancy_profiles: {
        Row: {
          created_at: string
          current_week: number
          due_date: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          id: string
          language_preference: string
          partner_email: string | null
          partner_name: string | null
          partner_phone: string | null
          patient_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_week?: number
          due_date: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          language_preference?: string
          partner_email?: string | null
          partner_name?: string | null
          partner_phone?: string | null
          patient_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_week?: number
          due_date?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          language_preference?: string
          partner_email?: string | null
          partner_name?: string | null
          partner_phone?: string | null
          patient_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      pregnancy_reminders: {
        Row: {
          created_at: string
          id: string
          is_sent: boolean
          patient_id: string
          reminder_date: string
          reminder_description: string | null
          reminder_title: string
          sent_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_sent?: boolean
          patient_id: string
          reminder_date: string
          reminder_description?: string | null
          reminder_title: string
          sent_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_sent?: boolean
          patient_id?: string
          reminder_date?: string
          reminder_description?: string | null
          reminder_title?: string
          sent_at?: string | null
        }
        Relationships: []
      }
      pregnancy_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          day_number: number
          id: string
          is_completed: boolean
          patient_id: string
          task_description: string | null
          task_title: string
          task_type: string
          week_number: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          day_number: number
          id?: string
          is_completed?: boolean
          patient_id: string
          task_description?: string | null
          task_title: string
          task_type: string
          week_number: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          day_number?: number
          id?: string
          is_completed?: boolean
          patient_id?: string
          task_description?: string | null
          task_title?: string
          task_type?: string
          week_number?: number
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          appointment_id: string | null
          created_at: string
          doctor_id: string
          document_url: string | null
          id: string
          instructions: string | null
          medications: string
          patient_email: string | null
          patient_id: string | null
          patient_name: string | null
          prescription_date: string
          prescription_file_name: string | null
          prescription_notes: string | null
          sent_via_email: boolean | null
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          created_at?: string
          doctor_id: string
          document_url?: string | null
          id?: string
          instructions?: string | null
          medications: string
          patient_email?: string | null
          patient_id?: string | null
          patient_name?: string | null
          prescription_date?: string
          prescription_file_name?: string | null
          prescription_notes?: string | null
          sent_via_email?: boolean | null
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          created_at?: string
          doctor_id?: string
          document_url?: string | null
          id?: string
          instructions?: string | null
          medications?: string
          patient_email?: string | null
          patient_id?: string | null
          patient_name?: string | null
          prescription_date?: string
          prescription_file_name?: string | null
          prescription_notes?: string | null
          sent_via_email?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          created_at: string
          id: string
          medicine_id: string
          order_id: string
          rating: number
          review_text: string | null
          updated_at: string
          user_phone: string
        }
        Insert: {
          created_at?: string
          id?: string
          medicine_id: string
          order_id: string
          rating: number
          review_text?: string | null
          updated_at?: string
          user_phone: string
        }
        Update: {
          created_at?: string
          id?: string
          medicine_id?: string
          order_id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string
          user_phone?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_approved: boolean | null
          is_doctor_pending: boolean | null
          name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_approved?: boolean | null
          is_doctor_pending?: boolean | null
          name: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_approved?: boolean | null
          is_doctor_pending?: boolean | null
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      recovery_programs: {
        Row: {
          created_at: string
          id: string
          program_name: string
          surgery_type: string
          total_days: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          program_name: string
          surgery_type: string
          total_days?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          program_name?: string
          surgery_type?: string
          total_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      recovery_tasks: {
        Row: {
          created_at: string
          day_number: number
          difficulty_level: number
          estimated_duration_minutes: number | null
          id: string
          program_id: string | null
          task_description: string
          task_title: string
          task_type: string
        }
        Insert: {
          created_at?: string
          day_number: number
          difficulty_level?: number
          estimated_duration_minutes?: number | null
          id?: string
          program_id?: string | null
          task_description: string
          task_title: string
          task_type?: string
        }
        Update: {
          created_at?: string
          day_number?: number
          difficulty_level?: number
          estimated_duration_minutes?: number | null
          id?: string
          program_id?: string | null
          task_description?: string
          task_title?: string
          task_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "recovery_tasks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "recovery_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          doctor_id: string
          id: string
          patient_id: string
          rating: number
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          doctor_id: string
          id?: string
          patient_id: string
          rating: number
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          doctor_id?: string
          id?: string
          patient_id?: string
          rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          admin_response: string | null
          created_at: string
          description: string
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_response?: string | null
          created_at?: string
          description: string
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_response?: string | null
          created_at?: string
          description?: string
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      symptom_reports: {
        Row: {
          created_at: string
          doctor_notified: boolean
          id: string
          patient_id: string
          requires_emergency: boolean
          severity_level: number
          symptoms: Json
        }
        Insert: {
          created_at?: string
          doctor_notified?: boolean
          id?: string
          patient_id: string
          requires_emergency?: boolean
          severity_level: number
          symptoms: Json
        }
        Update: {
          created_at?: string
          doctor_notified?: boolean
          id?: string
          patient_id?: string
          requires_emergency?: boolean
          severity_level?: number
          symptoms?: Json
        }
        Relationships: []
      }
      system_alerts: {
        Row: {
          created_at: string
          id: string
          is_resolved: boolean | null
          message: string
          severity: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          message: string
          severity?: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_resolved?: boolean | null
          message?: string
          severity?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      verified_doctors: {
        Row: {
          biography: string | null
          category: string
          created_at: string | null
          doctor_id: string
          email: string
          full_name: string
          id: string
          medical_degree: string
          mobile_number: string
          photo_url: string | null
          rating: number | null
          updated_at: string | null
        }
        Insert: {
          biography?: string | null
          category: string
          created_at?: string | null
          doctor_id: string
          email: string
          full_name: string
          id?: string
          medical_degree: string
          mobile_number: string
          photo_url?: string | null
          rating?: number | null
          updated_at?: string | null
        }
        Update: {
          biography?: string | null
          category?: string
          created_at?: string | null
          doctor_id?: string
          email?: string
          full_name?: string
          id?: string
          medical_degree?: string
          mobile_number?: string
          photo_url?: string | null
          rating?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_update_bed_count: {
        Args: { bed_id: string; field_name: string; new_value: number }
        Returns: undefined
      }
      admin_update_blood_donor_status: {
        Args: { admin_response?: string; donor_id: string; new_status: string }
        Returns: undefined
      }
      admin_update_blood_request_status: {
        Args: {
          admin_response?: string
          new_status: string
          request_id: string
        }
        Returns: undefined
      }
      admin_update_order_status: {
        Args: { new_status: string; order_id: string }
        Returns: undefined
      }
      admin_update_ot_status: {
        Args: { new_status: boolean; ot_id: string }
        Returns: undefined
      }
      approve_doctor_and_move_to_public: {
        Args: { request_id: string }
        Returns: undefined
      }
      approve_doctor_profile: {
        Args: {
          doctor_email: string
          doctor_experience: number
          doctor_fee?: number
          doctor_hospital: string
          doctor_id: string
          doctor_name: string
          doctor_phone?: string
          doctor_specialization: string
        }
        Returns: undefined
      }
      approve_doctor_request: {
        Args: { request_id: string }
        Returns: undefined
      }
      approve_verification_request: {
        Args: { request_id: string }
        Returns: undefined
      }
      cleanup_orphaned_doctor_profiles: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_booking_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      submit_doctor_review: {
        Args: { _comment?: string; _doctor_id: string; _rating: number }
        Returns: {
          action: string
          id: string
        }[]
      }
      verify_admin: {
        Args: { admin_password: string; admin_username: string }
        Returns: {
          id: string
          username: string
        }[]
      }
    }
    Enums: {
      user_role: "patient" | "doctor" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["patient", "doctor", "admin"],
    },
  },
} as const
