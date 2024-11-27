"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useTicketStore } from "../lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Clock, Users, CheckCircle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import CategoryCard from "../components/CategoryCard";
import type { Category } from "@/lib/types";
import { Progress } from "@/components/ui/progress";

const ClientView: React.FC = () => {
  const { createTicket, categories, fetchCategories, loading, tickets } = useTicketStore();
  const [name, setName] = useState('');
  const [currentView, setCurrentView] = useState('name');
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setFadeOut(true);
      setTimeout(() => {
        setCurrentView('categories');
        setFadeOut(false);
      }, 500);
    }
  };

  const handleCategoryClick = async (category: Category) => {
    if (loading || !name.trim()) {
      toast({
        title: "Error",
        description: "Por favor, ingrese su nombre para continuar",
        variant: "destructive"
      });
      return;
    }

    try {
      const ticket = await createTicket({
        categoryId: category.id,
        customerName: name,
      });

      if (ticket) {
        // Mensaje específico para servicio técnico
        if (category.type?.includes('tech_support') || 
            category.type === 'hardware' || 
            category.type === 'network') {
          toast({
            title: "Ticket Creado - Servicio Técnico",
            description: `Su número es ${ticket.number}. Por favor, diríjase a ${
              ticket.counter === 5 ? 'Servicio Técnico 1' : 'Servicio Técnico 2'
            }`,
          });
        } else {
          toast({
            title: "Ticket Creado",
            description: `Su número es ${ticket.number}. Por favor, espere a ser llamado`,
          });
        }

        setFadeOut(true);
        setTimeout(() => {
          setCurrentView('thanks');
          setFadeOut(false);
        }, 500);

        // Resetear después de 5 segundos
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(() => {
            setCurrentView('name');
            setName('');
            setFadeOut(false);
          }, 500);
        }, 5000);
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el ticket. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const getWaitingInfo = useCallback(() => {
    const waitingCount = tickets.filter(t => t.status === "waiting").length;
    const avgWaitTime = tickets
      .filter(t => t.status === "completed")
      .reduce((acc, t) => acc + (t.estimated_time || 0), 0) / Math.max(waitingCount, 1);

    return {
      waitingCount,
      avgWaitTime: Math.round(avgWaitTime)
    };
  }, [tickets]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-8 w-auto"
            />
            <h1 className="text-xl font-bold text-gray-800">Video Digital</h1>
          </div>
          {currentView !== 'name' && (
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-gray-600">
                  En espera: <strong>{getWaitingInfo().waitingCount}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="text-gray-600">
                  Tiempo estimado: <strong>{getWaitingInfo().avgWaitTime} min</strong>
                </span>
              </div>
            </div>
          )}
          <p className="text-sm text-gray-500">
            Sistema de Gestión de Turnos
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className={`transition-all duration-500 ${fadeOut ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>
          {currentView === 'name' && (
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <form onSubmit={handleNameSubmit} className="space-y-6">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    Bienvenido
                  </h2>
                  <p className="text-gray-600">
                    Por favor, ingrese su nombre para comenzar
                  </p>
                </div>
                <Input
                  type="text"
                  placeholder="Ingrese su nombre completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full"
                  required
                />
                <Button type="submit" className="w-full">
                  Continuar
                </Button>
              </form>
            </div>
          )}

          {currentView === 'categories' && (
            <div className="space-y-6">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                  Seleccione el tipo de atención
                </h2>
                <p className="text-lg text-gray-600">
                  Hola {name}, por favor elija la categoría que mejor se adapte a su necesidad
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onClick={() => handleCategoryClick(category)}
                    isLoading={loading}
                  />
                ))}
              </div>
            </div>
          )}

          {currentView === 'thanks' && (
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                ¡Gracias {name}!
              </h2>
              <div className="space-y-2">
                <p className="text-lg text-gray-600">
                  Su turno ha sido generado exitosamente.
                </p>
                <div className="flex items-center justify-center space-x-2 text-gray-700">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <span>Por favor, espere a ser llamado</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  color: string;
  progress: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, color, progress }) => {
  return (
    <div className={`bg-${color}-50 rounded-xl p-4 sm:p-6 shadow-md`}>
      <p className="text-base sm:text-lg font-medium text-gray-600 mb-2">{title}</p>
      <p className={`text-2xl sm:text-4xl font-bold text-${color}-600`}>{value}</p>
      <Progress value={progress} className="mt-4" />
      <p className="text-xs sm:text-sm text-gray-500 mt-2">{description}</p>
    </div>
  );
}

export default ClientView;

