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
  logo_url?: string;
  created_by?: string;
  createdAt: string;
  updatedAt: string;
};

export type ExchangeRate = {
  _id: string;
  type: "baht_to_kyat" | "kyat_to_baht";
  rate: number;
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
  transaction_type: "deposit" | "withdraw" | "transfer" | "receive" | "buy" | "exchange_out" | "exchange_in" | "expense" | "expense_reversal" | "product_sale";
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

export type Customer = {
  _id: string;
  name: string;
  phone?: string;
  address?: string;
  note?: string;
  created_by?: string;
  createdAt: string;
  updatedAt: string;
};

export type Expense = {
  _id: string;
  shareholder_id: string | { _id: string; name: string };
  payment_id: string | { _id: string; name: string; currency_type?: string };
  date: string;
  amount: number;
  note?: string;
  created_by?: string;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  _id: string;
  name: string;
  is_sale?: boolean;
  created_by?: string;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  _id: string;
  category_id: string | { _id: string; name: string; is_sale?: boolean };
  name: string;
  quantity: number;
  image?: string;
  purchase_price: number;
  sale_price: number;
  note?: string;
  created_by?: string;
  createdAt: string;
  updatedAt: string;
};

export type SaleListItem = {
  _id: string;
  date: string;
  product_id: string | { _id: string; name: string; image?: string; sale_price?: number };
  customer_id: string | { _id: string; name: string; phone?: string };
  currency_type: "kyat" | "baht";
  rate?: number;
  quantity: number;
  original_price: number;
  sale_price: number;
  discount: number;
  note?: string;
  created_by?: string;
  createdAt: string;
  updatedAt: string;
};
