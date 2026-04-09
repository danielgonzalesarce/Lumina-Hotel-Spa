import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant } from './types';
import { storage } from './services/storage';

interface TenantContextType {
  currentTenant: Tenant | null;
  setCurrentTenant: (tenant: Tenant | null) => void;
  availableTenants: Tenant[];
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);

  useEffect(() => {
    // Cargar todos los tenants disponibles
    const tenants = storage.getTenants();
    setAvailableTenants(tenants);

    // Por defecto, seleccionar el primer tenant activo si no hay ninguno seleccionado
    // En un entorno real, esto se determinaría por el subdominio (ej: hotel1.misistema.com)
    const savedTenantId = localStorage.getItem('active_tenant_id');
    if (savedTenantId) {
      const found = tenants.find(t => t.id === savedTenantId);
      if (found) setCurrentTenant(found);
    } else if (tenants.length > 0) {
      setCurrentTenant(tenants[0]);
    }
  }, []);

  // Efecto para aplicar el color primario dinámicamente
  useEffect(() => {
    if (currentTenant?.theme?.primaryColor) {
      document.documentElement.style.setProperty('--color-primary', currentTenant.theme.primaryColor);
    } else {
      // Color por defecto (Indigo 600)
      document.documentElement.style.setProperty('--color-primary', '#4f46e5');
    }
  }, [currentTenant]);

  const handleSetTenant = (tenant: Tenant | null) => {
    setCurrentTenant(tenant);
    if (tenant) {
      localStorage.setItem('active_tenant_id', tenant.id);
    } else {
      localStorage.removeItem('active_tenant_id');
    }
  };

  return (
    <TenantContext.Provider value={{ currentTenant, setCurrentTenant: handleSetTenant, availableTenants }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
