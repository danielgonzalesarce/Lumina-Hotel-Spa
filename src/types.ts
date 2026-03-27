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
  role: 'user' | 'admin';
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
