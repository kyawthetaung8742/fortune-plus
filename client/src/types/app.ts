export type User = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  profile_image: string;
  created_at: Date;
  updated_at: Date;
};

export type Shareholder = {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  created_by?: string;
  createdAt: string;
  updatedAt: string;
};

export type Payment = {
  _id: string;
  name: string;
  currency_type: "kyat" | "baht";
  created_by?: string;
  createdAt: string;
  updatedAt: string;
};

export type TransactionHistory = {
  _id: string;
  shareholder_id: string;
  payment_id: string;
  transaction_number: string;
  date: string;
  before_amount: number;
  amount: number;
  after_amount: number;
  transaction_type: "deposit" | "withdraw" | "transfer" | "receive" | "buy";
  note?: string;
  created_by?: string;
  createdAt: string;
  updatedAt: string;
};

export type Wallet = {
  _id: string;
  shareholder_id: string;
  payment_id: string | Payment;
  amount: number;
  created_by?: string;
  createdAt: string;
  updatedAt: string;
};
