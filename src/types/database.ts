export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      business_profiles: {
        Row: {
          id: string;
          user_id: string;
          business_name: string;
          business_category: string;
          phone: string;
          whatsapp: string;
          email: string;
          address: string;
          logo_url: string;
          tax_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_name?: string;
          business_category?: string;
          phone?: string;
          whatsapp?: string;
          email?: string;
          address?: string;
          logo_url?: string;
          tax_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_name?: string;
          business_category?: string;
          phone?: string;
          whatsapp?: string;
          email?: string;
          address?: string;
          logo_url?: string;
          tax_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      payment_methods: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          name: string;
          account_name: string;
          account_number: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          name: string;
          account_name: string;
          account_number: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          name?: string;
          account_name?: string;
          account_number?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      wallets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string;
          icon: string;
          balance: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: string;
          icon?: string;
          balance?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: string;
          icon?: string;
          balance?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string;
          icon: string;
          color: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: string;
          icon?: string;
          color?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: string;
          icon?: string;
          color?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          wallet_id: string;
          category_id: string;
          type: string;
          amount: number;
          description: string;
          date: string;
          attachment_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          wallet_id: string;
          category_id: string;
          type: string;
          amount: number;
          description: string;
          date: string;
          attachment_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          wallet_id?: string;
          category_id?: string;
          type?: string;
          amount?: number;
          description?: string;
          date?: string;
          attachment_url?: string | null;
          created_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone: string;
          email: string;
          address: string;
          note: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          phone?: string;
          email?: string;
          address?: string;
          note?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          phone?: string;
          email?: string;
          address?: string;
          note?: string;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string;
          type: string;
          price: number;
          stock: number;
          unit: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category?: string;
          type?: string;
          price?: number;
          stock?: number;
          unit?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          category?: string;
          type?: string;
          price?: number;
          stock?: number;
          unit?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          user_id: string;
          customer_id: string;
          invoice_number: string;
          title: string;
          type: string;
          status: string;
          subtotal: number;
          discount: number;
          tax: number;
          total: number;
          dp: number;
          remaining: number;
          notes: string;
          issue_date: string;
          due_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          customer_id: string;
          invoice_number: string;
          title?: string;
          type?: string;
          status?: string;
          subtotal?: number;
          discount?: number;
          tax?: number;
          total?: number;
          dp?: number;
          remaining?: number;
          notes?: string;
          issue_date?: string;
          due_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          customer_id?: string;
          invoice_number?: string;
          title?: string;
          type?: string;
          status?: string;
          subtotal?: number;
          discount?: number;
          tax?: number;
          total?: number;
          dp?: number;
          remaining?: number;
          notes?: string;
          issue_date?: string;
          due_date?: string;
          created_at?: string;
        };
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          name: string;
          description: string;
          quantity: number;
          price: number;
          total: number;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          name: string;
          description?: string;
          quantity?: number;
          price?: number;
          total?: number;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          name?: string;
          description?: string;
          quantity?: number;
          price?: number;
          total?: number;
        };
      };
      spec_print: {
        Row: {
          invoice_id: string;
          book_size: string;
          binding: string;
          final_size: string;
          paper_type: string;
          cover_type: string;
          laminating: string;
          wrapping: string;
        };
        Insert: {
          invoice_id: string;
          book_size?: string;
          binding?: string;
          final_size?: string;
          paper_type?: string;
          cover_type?: string;
          laminating?: string;
          wrapping?: string;
        };
        Update: {
          invoice_id?: string;
          book_size?: string;
          binding?: string;
          final_size?: string;
          paper_type?: string;
          cover_type?: string;
          laminating?: string;
          wrapping?: string;
        };
      };
      spec_laptop: {
        Row: {
          invoice_id: string;
          laptop_name: string;
          processor: string;
          ram: string;
          storage: string;
          screen: string;
          condition: string;
          warranty: string;
        };
        Insert: {
          invoice_id: string;
          laptop_name?: string;
          processor?: string;
          ram?: string;
          storage?: string;
          screen?: string;
          condition?: string;
          warranty?: string;
        };
        Update: {
          invoice_id?: string;
          laptop_name?: string;
          processor?: string;
          ram?: string;
          storage?: string;
          screen?: string;
          condition?: string;
          warranty?: string;
        };
      };
      spec_umum: {
        Row: {
          invoice_id: string;
          trans_type: string;
          description: string;
        };
        Insert: {
          invoice_id: string;
          trans_type?: string;
          description?: string;
        };
        Update: {
          invoice_id?: string;
          trans_type?: string;
          description?: string;
        };
      };
      debts: {
        Row: {
          id: string;
          user_id: string;
          wallet_id: string;
          name: string;
          phone: string;
          amount: number;
          description: string;
          date: string;
          due_date: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          wallet_id: string;
          name: string;
          phone?: string;
          amount: number;
          description?: string;
          date: string;
          due_date?: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          wallet_id?: string;
          name?: string;
          phone?: string;
          amount?: number;
          description?: string;
          date?: string;
          due_date?: string;
          status?: string;
          created_at?: string;
        };
      };
      receivables: {
        Row: {
          id: string;
          user_id: string;
          wallet_id: string;
          name: string;
          phone: string;
          amount: number;
          description: string;
          date: string;
          due_date: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          wallet_id: string;
          name: string;
          phone?: string;
          amount: number;
          description?: string;
          date: string;
          due_date?: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          wallet_id?: string;
          name?: string;
          phone?: string;
          amount?: number;
          description?: string;
          date?: string;
          due_date?: string;
          status?: string;
          created_at?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          amount: number;
          period: string;
          start_date: string;
          end_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          amount: number;
          period?: string;
          start_date: string;
          end_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          amount?: number;
          period?: string;
          start_date?: string;
          end_date?: string;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          table_name: string;
          record_id: string;
          old_data: Json;
          new_data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          table_name: string;
          record_id: string;
          old_data?: Json;
          new_data?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          table_name?: string;
          record_id?: string;
          old_data?: Json;
          new_data?: Json;
          created_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          theme: string;
          currency: string;
          language: string;
          ai_enabled: boolean;
          ai_api_key: string;
          notifications_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          theme?: string;
          currency?: string;
          language?: string;
          ai_enabled?: boolean;
          ai_api_key?: string;
          notifications_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          theme?: string;
          currency?: string;
          language?: string;
          ai_enabled?: boolean;
          ai_api_key?: string;
          notifications_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_insights: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          description: string;
          data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          description: string;
          data?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          description?: string;
          data?: Json;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}
