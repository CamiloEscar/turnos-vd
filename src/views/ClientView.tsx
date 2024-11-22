"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Users, CreditCard, AlertCircle, HelpCircle, PhoneCall, X, Clock } from 'lucide-react';
import { useTicketStore } from "../lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import CategoryCard from "../components/CategoryCard";
import QRCodeComponent from "../components/QRCode";

const ClientView: React.FC = () => {
  const { createTicket, categories, fetchCategories, stats, tickets } = useTicketStore();
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState('name');
  const [name, setName] = useState('');
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const calculateEstimatedTime = useCallback((categoryId: number) => {
    const waitingTickets = tickets.filter((t) => t.status === "waiting");
    const categoryTickets = waitingTickets.filter(
      (t) => t.category_id === categoryId
    );

    let baseTime;
    switch (categoryId) {
      case 1: baseTime = 10; break;
      case 2: baseTime = 5; break;
      case 3: baseTime = 15; break;
      case 4: baseTime = 8; break;
      case 5: baseTime = 20; break;
      case 6: baseTime = 12; break;
      default: baseTime = 10;
    }

    return baseTime;
  }, [tickets]);

  const getCategoryIcon = useCallback((categoryId: number) => {
    switch (categoryId) {
      case 1: return Users;
      case 2: return CreditCard;
      case 3: return AlertCircle;
      case 4: return HelpCircle;
      case 5: return PhoneCall;
      case 6: return X;
      default: return HelpCircle;
    }
  }, []);

  const getCategoryColor = useCallback((categoryId: number) => {
    switch (categoryId) {
      case 1: return "blue";
      case 2: return "green";
      case 3: return "red";
      case 4: return "purple";
      case 5: return "indigo";
      case 6: return "pink";
      default: return "gray";
    }
  }, []);

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

  const handleCreateTicket = useCallback(async (categoryId: number) => {
    if (isCreatingTicket) return;

    try {
      setIsCreatingTicket(true);
      setSelectedCategory(categoryId);

      const estimatedTime = calculateEstimatedTime(categoryId);
      await createTicket({
        categoryId,
        estimatedTime,
        customerName: name,
      });

      setFadeOut(true);
      setTimeout(() => {
        setCurrentView('thanks');
        setFadeOut(false);
      }, 500);

      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          setCurrentView('name');
          setName('');
          setSelectedCategory(null);
          setIsCreatingTicket(false);
          setFadeOut(false);
        }, 500);
      }, 5000);

    } catch (error) {
      console.error("Error creating ticket:", error);
    } finally {
      setIsCreatingTicket(false);
    }
  }, [isCreatingTicket, calculateEstimatedTime, createTicket, name]);

  const getPeopleWaiting = useCallback((categoryId: number) => {
    return tickets.filter(
      (t) => t.status === "waiting" && t.category_id === categoryId
    ).length;
  }, [tickets]);

  return (
    <div className="min-h-screen bg-blue-50">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <img
              src="/logo.png"
              alt="Video Digital Logo"
            />
            <h1 className="text-2xl font-bold text-gray-800">Video Digital</h1>
          </div>
          <p className="text-lg text-gray-600 text-center sm:text-left">
            Sistema de Gestión de Turnos
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
            <div className="space-y-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800">
                Seleccione el tipo de atención
              </h2>
              <p className="text-lg sm:text-xl text-center text-gray-600">
                {name}, por favor elija la categoría que mejor se adapte a su necesidad
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {categories.map((category) => (
                  <TooltipProvider key={category.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CategoryCard
                          icon={getCategoryIcon(category.id)}
                          title={category.name}
                          description={category.description}
                          color={getCategoryColor(category.id)}
                          estimatedTime={calculateEstimatedTime(category.id)}
                          peopleWaiting={getPeopleWaiting(category.id)}
                          onClick={() => handleCreateTicket(category.id)}
                          className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                          isLoading={isCreatingTicket && selectedCategory === category.id}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Haga clic para generar un turno de {category.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          )}

          {currentView === 'thanks' && (
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                ¡Gracias {name}!
              </h2>
              <p className="text-lg sm:text-xl text-gray-600">
                Su turno ha sido generado exitosamente.
              </p>
              <div className="flex items-center justify-center space-x-2 text-lg text-gray-700">
                <Clock className="w-6 h-6" />
                <span>Por favor, espere a ser llamado</span>
              </div>
            </div>
          )}
        </div>

        {stats && currentView !== 'thanks' && (
          <div className="mt-8 sm:mt-12 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 text-white">
              <h2 className="text-xl sm:text-2xl font-bold mb-2 text-center">
                Estadísticas en Tiempo Real
              </h2>
              <p className="text-center text-blue-100">
                Información actualizada sobre nuestro servicio
              </p>
            </div>
            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <StatCard
                title="En Espera"
                value={stats.waiting_count}
                description="Personas esperando ser atendidas"
                color="blue"
                progress={(stats.waiting_count / (stats.waiting_count + stats.serving_count)) * 100}
              />
              <StatCard
                title="En Atención"
                value={stats.serving_count}
                description="Clientes siendo atendidos ahora"
                color="green"
                progress={(stats.serving_count / (stats.waiting_count + stats.serving_count)) * 100}
              />
              <StatCard
                title="Tiempo Promedio"
                value={`${Math.round(stats.avg_wait_time || 0)} min`}
                description="Tiempo promedio de espera"
                color="indigo"
                progress={(stats.avg_wait_time / 30) * 100}
              />
            </div>
          </div>
        )}

        <div className="mt-8 sm:mt-12 max-w-md mx-auto">
          <h3 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-4 sm:mb-6">
            ¿Prefiere usar su teléfono?
          </h3>
          <QRCodeComponent url="https://192.168.1.5:5173" />
        </div>
      </main>
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

