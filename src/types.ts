export enum RoomType {
  Standard = 'Estándar',
  Double = 'Doble',
  Suite = 'Suite',
  PremiumSuite = 'Suite Premium'
}

export enum RoomStatus {
  Available = 'Disponible',
  Reserved = 'Reservada',
  Occupied = 'Ocupada',
  Cleaning = 'En limpieza',
  Maintenance = 'Mantenimiento'
}

export interface Room {
  id: string;
  number: string;
  floor: string; // Added floor field
  name: string;
  type: RoomType;
  description: string;
  price: number;
  capacity: number;
  images: string[];
  amenities: string[];
  featured?: boolean;
  status: RoomStatus;
}

export type InvoiceType = 'Boleta' | 'Factura';

export interface Invoice {
  id: string;
  reservationId: string;
  type: InvoiceType;
  clientName: string;
  clientDocument: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  subtotal: number;
  extras: { name: string; price: number }[];
  total: number;
  date: string;
}

export interface Reservation {
  id: string;
  roomId: string;
  roomName: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'pending_payment';
  depositPaid?: number;
  remainingBalance?: number;
  extras: {
    breakfast: boolean;
    shuttle: boolean;
    extraBed: boolean;
  };
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  approved: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin' | 'super_admin';
  password?: string;
}

export interface HotelConfig {
  name: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  description?: string;
  facebook?: string;
  instagram?: string;
  logo?: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
}

export interface Complaint {
  id: string;
  date: string;
  fullName: string;
  documentType: 'DNI' | 'CE' | 'Pasaporte';
  documentNumber: string;
  email: string;
  phone: string;
  address: string;
  type: 'Reclamo' | 'Queja';
  description: string;
  status: 'Pendiente' | 'Atendido';
}

export interface Tenant {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  plan: 'Básico' | 'Pro' | 'Enterprise';
  status: 'Activo' | 'Inactivo' | 'Suspendido';
  createdAt: string;
  nextBillingDate: string;
  monthlyFee: number;
  theme?: {
    primaryColor: string;
    logoUrl?: string;
    coverUrl?: string;
  };
}

export interface TenantInvoice {
  id: string;
  tenantId: string;
  tenantName: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'Pagado' | 'Pendiente' | 'Vencido';
  plan: 'Básico' | 'Pro' | 'Enterprise';
}

export interface GlobalConfig {
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  defaultCurrency: string;
  plans: {
    basic: { price: number; maxRooms: number; maxUsers: number };
    pro: { price: number; maxRooms: number; maxUsers: number };
    enterprise: { price: number; maxRooms: number; maxUsers: number };
  };
}
