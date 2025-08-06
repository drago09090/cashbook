export interface User {
  id: string;
  email: string;
  full_name?: string;
  business_name?: string;
  skip_business?: boolean;
  business_category?: string[];
  business_type?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export interface BusinessCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface BusinessType {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Book {
  id: string;
  name: string;
  user_id: string;
  business_id?: string;
  business_name?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  name: string;
  owner_id: string;
  category: string[];
  type: string;
  created_at: string;
  updated_at: string;
}

export interface BookMember {
  id: string;
  book_id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export interface Entry {
  id: string;
  book_id: string;
  user_id: string;
  type: 'cash_in' | 'cash_out';
  amount: number;
  contact_name: string;
  remarks: string;
  category: string;
  payment_mode: string;
  date: string;
  time: string;
  attachments?: string[];
  voice_recording?: string;
  custom_fields: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ReportSettings {
  columns: {
    date: boolean;
    cashIn: boolean;
    cashOut: boolean;
    balance: boolean;
    category: boolean;
    remark: boolean;
    paymentModes: boolean;
    attachments: boolean;
    voice: boolean;
    members: boolean;
    contact: boolean;
    time: boolean;
  };
  customFields: Record<string, boolean>;
  otherOptions: {
    userNameAndNumber: boolean;
    appliedFilters: boolean;
  };
}

export interface Invoice {
  id: string;
  invoice_number: string;
  user_id: string;
  book_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes: string;
  created_at: string;
  updated_at: string;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}