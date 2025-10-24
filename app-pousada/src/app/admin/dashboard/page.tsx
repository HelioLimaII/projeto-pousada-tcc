// Em: src/app/admin/dashboard/page.tsx
'use client';

// Importa o componente do Mapa de Reservas
import BookingMap from "@/components/ui/admin/BookingMap";

// A página principal do dashboard agora apenas renderiza o componente BookingMap
export default function AdminDashboardPage() {
  
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* O componente do mapa é agora a principal funcionalidade desta página */}
      <BookingMap />
    </div>
  );
}

