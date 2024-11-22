import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Users, Monitor } from 'lucide-react';

const navItems = [
  { path: '/', icon: Users, label: 'Cliente', color: 'blue' },
  { path: '/counter', icon: LayoutGrid, label: 'Módulos', color: 'emerald' },
  { path: '/display', icon: Monitor, label: 'Pantalla', color: 'violet' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <nav className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              {navItems.map(({ path, icon: Icon, label, color }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center px-3 py-2 transition-colors ${
                    location.pathname === path
                      ? `text-${color}-600 border-b-2 border-${color}-600`
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-2 ${location.pathname === path ? `text-${color}-600` : ''}`} />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav> */}

      <main className="max-w-7xl mx-auto py-6 px-4">{children}</main>
    </div>
  );
}