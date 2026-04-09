import { Room, Reservation, Review, User, HotelConfig, Invoice, RoomStatus, GalleryImage, Complaint, Tenant, TenantInvoice, GlobalConfig } from '../types';
import { INITIAL_ROOMS, INITIAL_REVIEWS, INITIAL_USERS, INITIAL_CONFIG, INITIAL_GALLERY, INITIAL_TENANTS } from '../data/initialData';

const KEYS = {
  ROOMS: 'hotel_rooms',
  RESERVATIONS: 'hotel_reservations',
  REVIEWS: 'hotel_reviews',
  USERS: 'hotel_users',
  CONFIG: 'hotel_config',
  CURRENT_USER: 'hotel_current_user',
  INVOICES: 'hotel_invoices',
  GALLERY: 'hotel_gallery',
  COMPLAINTS: 'hotel_complaints',
  TENANTS: 'hotel_tenants',
  TENANT_INVOICES: 'hotel_tenant_invoices',
  GLOBAL_CONFIG: 'hotel_global_config'
};

const INITIAL_GLOBAL_CONFIG: GlobalConfig = {
  platformName: 'Lumina SaaS',
  supportEmail: 'soporte@lumina.com',
  supportPhone: '+1234567890',
  defaultCurrency: 'PEN',
  plans: {
    basic: { price: 99, maxRooms: 10, maxUsers: 2 },
    pro: { price: 199, maxRooms: 50, maxUsers: 10 },
    enterprise: { price: 499, maxRooms: 999, maxUsers: 999 }
  }
};

export const storage = {
  // Rooms
  getRooms: (): Room[] => {
    const data = localStorage.getItem(KEYS.ROOMS);
    let rooms: Room[] = [];
    
    if (!data) {
      rooms = INITIAL_ROOMS;
      localStorage.setItem(KEYS.ROOMS, JSON.stringify(rooms));
    } else {
      try {
        rooms = JSON.parse(data);
      } catch (e) {
        console.error("Error parsing rooms", e);
        rooms = INITIAL_ROOMS;
      }
      // Sincronización automática: si faltan habitaciones de INITIAL_ROOMS, las agregamos
      const existingIds = new Set(rooms.map((r: any) => r.id));
      const missingRooms = INITIAL_ROOMS.filter(r => !existingIds.has(r.id));
      
      if (missingRooms.length > 0) {
        rooms = [...rooms, ...missingRooms];
        localStorage.setItem(KEYS.ROOMS, JSON.stringify(rooms));
      }
    }

    // Migration for existing data without status or number
    return rooms.map((r: any) => ({
      ...r,
      status: r.status || RoomStatus.Available,
      number: r.number || r.id
    }));
  },
  saveRoom: (room: Room) => {
    const rooms = storage.getRooms();
    const index = rooms.findIndex(r => r.id === room.id);
    if (index >= 0) {
      rooms[index] = room;
    } else {
      rooms.push(room);
    }
    localStorage.setItem(KEYS.ROOMS, JSON.stringify(rooms));
  },
  updateRoomStatus: (id: string, status: RoomStatus) => {
    const rooms = storage.getRooms();
    const index = rooms.findIndex(r => r.id === id);
    if (index >= 0) {
      rooms[index].status = status;
      localStorage.setItem(KEYS.ROOMS, JSON.stringify(rooms));
    }
  },
  deleteRoom: (id: string) => {
    const rooms = storage.getRooms().filter(r => r.id !== id);
    localStorage.setItem(KEYS.ROOMS, JSON.stringify(rooms));
  },

  // Reservations
  getReservations: (): Reservation[] => {
    const data = localStorage.getItem(KEYS.RESERVATIONS);
    try {
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error parsing reservations", e);
      return [];
    }
  },
  saveReservation: (res: Reservation) => {
    const reservations = storage.getReservations();
    const index = reservations.findIndex(r => r.id === res.id);
    if (index >= 0) {
      reservations[index] = res;
    } else {
      reservations.push(res);
    }
    localStorage.setItem(KEYS.RESERVATIONS, JSON.stringify(reservations));
  },
  updateReservationStatus: (id: string, status: Reservation['status']) => {
    const reservations = storage.getReservations();
    const index = reservations.findIndex(r => r.id === id);
    if (index >= 0) {
      reservations[index].status = status;
      localStorage.setItem(KEYS.RESERVATIONS, JSON.stringify(reservations));
    }
  },
  deleteReservation: (id: string) => {
    const reservations = storage.getReservations().filter(r => r.id !== id);
    localStorage.setItem(KEYS.RESERVATIONS, JSON.stringify(reservations));
  },

  // Invoices
  getInvoices: (): Invoice[] => {
    const data = localStorage.getItem(KEYS.INVOICES);
    try {
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error parsing invoices", e);
      return [];
    }
  },
  saveInvoice: (invoice: Invoice) => {
    const invoices = storage.getInvoices();
    invoices.push(invoice);
    localStorage.setItem(KEYS.INVOICES, JSON.stringify(invoices));
  },

  // Reviews
  getReviews: (): Review[] => {
    const data = localStorage.getItem(KEYS.REVIEWS);
    let reviews: Review[] = [];
    
    if (!data) {
      reviews = INITIAL_REVIEWS;
      localStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));
    } else {
      try {
        reviews = JSON.parse(data);
      } catch (e) {
        console.error("Error parsing reviews", e);
        reviews = INITIAL_REVIEWS;
      }
      // Sincronización automática: si faltan reseñas de INITIAL_REVIEWS, las agregamos
      const existingIds = new Set(reviews.map((r: any) => r.id));
      const missingReviews = INITIAL_REVIEWS.filter(r => !existingIds.has(r.id));
      
      if (missingReviews.length > 0) {
        reviews = [...reviews, ...missingReviews];
        localStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));
      }
    }
    return reviews;
  },
  saveReview: (review: Review) => {
    const reviews = storage.getReviews();
    reviews.push(review);
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));
  },
  approveReview: (id: string) => {
    const reviews = storage.getReviews();
    const index = reviews.findIndex(r => r.id === id);
    if (index >= 0) {
      reviews[index].approved = true;
      localStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));
    }
  },
  deleteReview: (id: string) => {
    const reviews = storage.getReviews().filter(r => r.id !== id);
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));
  },

  // Auth
  getUsers: (): User[] => {
    const data = localStorage.getItem(KEYS.USERS);
    let users: User[] = [];
    
    if (!data) {
      users = INITIAL_USERS;
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    } else {
      try {
        users = JSON.parse(data);
      } catch (e) {
        console.error("Error parsing users", e);
        users = INITIAL_USERS;
      }
      // Sincronización automática: si faltan usuarios de INITIAL_USERS, los agregamos
      const existingEmails = new Set(users.map((u: any) => u.email));
      const missingUsers = INITIAL_USERS.filter(u => !existingEmails.has(u.email));
      
      if (missingUsers.length > 0) {
        users = [...users, ...missingUsers];
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      }
    }
    return users;
  },
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    try {
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Error parsing current user", e);
      return null;
    }
  },
  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
  },
  updateUser: (user: User) => {
    const users = storage.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      
      const current = storage.getCurrentUser();
      if (current && current.id === user.id) {
        storage.setCurrentUser(user);
      }
    }
  },
  saveUser: (user: User) => {
    const users = storage.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  // Config
  getConfig: (): HotelConfig => {
    const data = localStorage.getItem(KEYS.CONFIG);
    if (!data) {
      localStorage.setItem(KEYS.CONFIG, JSON.stringify(INITIAL_CONFIG));
      return INITIAL_CONFIG;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Error parsing config", e);
      return INITIAL_CONFIG;
    }
  },
  saveConfig: (config: HotelConfig) => {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
  },

  // Gallery
  getGallery: (): GalleryImage[] => {
    const data = localStorage.getItem(KEYS.GALLERY);
    if (!data) {
      localStorage.setItem(KEYS.GALLERY, JSON.stringify(INITIAL_GALLERY));
      return INITIAL_GALLERY;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Error parsing gallery", e);
      return INITIAL_GALLERY;
    }
  },
  saveGalleryImage: (image: GalleryImage) => {
    const gallery = storage.getGallery();
    const index = gallery.findIndex(img => img.id === image.id);
    if (index >= 0) {
      gallery[index] = image;
    } else {
      gallery.push(image);
    }
    localStorage.setItem(KEYS.GALLERY, JSON.stringify(gallery));
  },
  deleteGalleryImage: (id: string) => {
    const gallery = storage.getGallery().filter(img => img.id !== id);
    localStorage.setItem(KEYS.GALLERY, JSON.stringify(gallery));
  },

  // Complaints
  getComplaints: (): Complaint[] => {
    const data = localStorage.getItem(KEYS.COMPLAINTS);
    try {
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error parsing complaints", e);
      return [];
    }
  },
  saveComplaint: (complaint: Complaint) => {
    const complaints = storage.getComplaints();
    const index = complaints.findIndex(c => c.id === complaint.id);
    if (index >= 0) {
      complaints[index] = complaint;
    } else {
      complaints.push(complaint);
    }
    localStorage.setItem(KEYS.COMPLAINTS, JSON.stringify(complaints));
  },
  deleteComplaint: (id: string) => {
    const complaints = storage.getComplaints().filter(c => c.id !== id);
    localStorage.setItem(KEYS.COMPLAINTS, JSON.stringify(complaints));
  },

  // Tenants (Super Admin)
  getTenants: (): Tenant[] => {
    const data = localStorage.getItem(KEYS.TENANTS);
    if (!data) {
      localStorage.setItem(KEYS.TENANTS, JSON.stringify(INITIAL_TENANTS));
      return INITIAL_TENANTS;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Error parsing tenants", e);
      return INITIAL_TENANTS;
    }
  },
  saveTenant: (tenant: Tenant) => {
    const tenants = storage.getTenants();
    const index = tenants.findIndex(t => t.id === tenant.id);
    if (index >= 0) {
      tenants[index] = tenant;
    } else {
      tenants.push(tenant);
    }
    localStorage.setItem(KEYS.TENANTS, JSON.stringify(tenants));
  },
  deleteTenant: (id: string) => {
    const tenants = storage.getTenants().filter(t => t.id !== id);
    localStorage.setItem(KEYS.TENANTS, JSON.stringify(tenants));
  },

  // Tenant Invoices
  getTenantInvoices: (): TenantInvoice[] => {
    const data = localStorage.getItem(KEYS.TENANT_INVOICES);
    try {
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error parsing tenant invoices", e);
      return [];
    }
  },
  saveTenantInvoice: (invoice: TenantInvoice) => {
    const invoices = storage.getTenantInvoices();
    const index = invoices.findIndex(i => i.id === invoice.id);
    if (index >= 0) {
      invoices[index] = invoice;
    } else {
      invoices.push(invoice);
    }
    localStorage.setItem(KEYS.TENANT_INVOICES, JSON.stringify(invoices));
  },
  deleteTenantInvoice: (id: string) => {
    const invoices = storage.getTenantInvoices().filter(i => i.id !== id);
    localStorage.setItem(KEYS.TENANT_INVOICES, JSON.stringify(invoices));
  },

  // Global Config
  getGlobalConfig: (): GlobalConfig => {
    const data = localStorage.getItem(KEYS.GLOBAL_CONFIG);
    if (!data) {
      localStorage.setItem(KEYS.GLOBAL_CONFIG, JSON.stringify(INITIAL_GLOBAL_CONFIG));
      return INITIAL_GLOBAL_CONFIG;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Error parsing global config", e);
      return INITIAL_GLOBAL_CONFIG;
    }
  },
  saveGlobalConfig: (config: GlobalConfig) => {
    localStorage.setItem(KEYS.GLOBAL_CONFIG, JSON.stringify(config));
  }
};
