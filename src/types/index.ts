export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type StockChannelType =
  | 'online'
  | 'internal'
  | 'other'
  | (string & {});

export interface ChannelType {
  id: string;
  name: string;
  code: string;
  badge_variant?: 'default' | 'warning' | 'purple' | 'info' | 'success' | 'danger';
  description?: string;
  created_at: string;
}

export type ProductStatus = 'active' | 'draft' | 'archived';
export type PurchaseStatus = 'draft' | 'ordered' | 'received' | 'cancelled';
export type SalesStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
export type MovementType =
  | 'purchase_entry'
  | 'sale_exit'
  | 'transfer'
  | 'adjustment_positive'
  | 'adjustment_negative'
  | 'return';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface StockLocation {
  id: string;
  name: string;
  code: string;
  channel_type: StockChannelType;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  document_type?: 'CPF' | 'CNPJ' | 'OTHER';
  status: 'active' | 'inactive' | 'blocked';
  notes?: string;
  created_at: string;
  updated_at: string;
  addresses?: CustomerAddress[];
}

export interface CustomerAddress {
  id: string;
  customer_id: string;
  address_type: 'shipping' | 'billing' | 'both';
  zip_code: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  is_default: boolean;
  created_at: string;
}

export interface Supplier {
  id: string;
  corporate_name: string;
  trade_name?: string;
  document?: string;
  email?: string;
  phone?: string;
  contact_person?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface ProductInventory {
  id: string;
  product_id: string;
  stock_location_id: string;
  quantity: number;
  reserved_quantity: number;
  min_quantity_alert: number;
  created_at: string;
  updated_at: string;
  stock_location?: StockLocation;
}

export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  category_id?: string;
  cost_price: number;
  price: number;
  min_price?: number;
  status: ProductStatus;
  weight_kg?: number;
  width_cm?: number;
  height_cm?: number;
  length_cm?: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  images?: ProductImage[];
  inventory?: ProductInventory[];
  total_stock?: number;
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id: string;
  quantity: number;
  unit_cost_price: number;
  subtotal: number;
  product?: Product;
}

export interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier_id?: string;
  destination_location_id: string;
  status: PurchaseStatus;
  total_amount: number;
  purchase_date: string;
  received_at?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
  destination_location?: StockLocation;
  items?: PurchaseOrderItem[];
}

export interface SalesOrderItem {
  id: string;
  sales_order_id: string;
  product_id: string;
  quantity: number;
  unit_sale_price: number;
  unit_cost_price: number;
  subtotal: number;
  profit: number;
  product?: Product;
}

export interface SalesOrder {
  id: string;
  order_number: string;
  customer_id?: string;
  stock_location_id: string;
  status: SalesStatus;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  total_amount: number;
  total_cost: number;
  gross_profit: number;
  sale_date: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  stock_location?: StockLocation;
  items?: SalesOrderItem[];
}

export interface InventoryMovement {
  id: string;
  product_id: string;
  movement_type: MovementType;
  quantity: number;
  source_location_id?: string;
  target_location_id?: string;
  reference_id?: string;
  reference_type?: string;
  unit_cost?: number;
  notes?: string;
  created_by?: string;
  created_at: string;
  product?: Product;
  source_location?: StockLocation;
  target_location?: StockLocation;
}
