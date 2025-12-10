'use client';

import {
    Menu,
    Bell,
    LogOut,
    User,
    Settings,
} from 'lucide-react';
import Image from 'next/image';
import { useSidebar } from '@/hooks/useSidebar';
import { useState, useEffect, useRef } from 'react';
import { useReportNotifications } from '@/hooks/useReports';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';



export function OverviewHeader() {

    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [isClosingProfile, setIsClosingProfile] = useState(false);
    const { notifications } = useReportNotifications();
    const notificationsRef = useRef<HTMLDivElement>(null);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            if (
                showNotifications &&
                notificationsRef.current &&
                !notificationsRef.current.contains(target)
            ) {
                setIsClosing(true);
                setTimeout(() => {
                    setShowNotifications(false);
                    setIsClosing(false);
                }, 300);
            }

            if (
                showProfileMenu &&
                profileMenuRef.current &&
                !profileMenuRef.current.contains(target)
            ) {
                setIsClosingProfile(true);
                setTimeout(() => {
                    setShowProfileMenu(false);
                    setIsClosingProfile(false);
                }, 300);
            }
        };

        if (showNotifications || showProfileMenu) {
            document.addEventListener("click", handleClickOutside);
            return () => document.removeEventListener("click", handleClickOutside);
        }
    }, [showNotifications, showProfileMenu]);

    const handleToggleNotifications = () => {
        if (showNotifications) {
            setIsClosing(true);
            setTimeout(() => {
                setShowNotifications(false);
                setIsClosing(false);
            }, 300);
        } else {
            setShowNotifications(true);
        }
    };

    const handleToggleProfileMenu = () => {
        if (showProfileMenu) {
            setIsClosingProfile(true);
            setTimeout(() => {
                setShowProfileMenu(false);
                setIsClosingProfile(false);
            }, 300);
        } else {
            setShowProfileMenu(true);
        }
    };

    const { logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const { toggleSidebar, isSidebarOpen } = useSidebar();

    return (
        <header className="w-full flex items-center justify-between mt-10 border-b border-gray-200 pb-5 ">
            {/* First */}
            <div className="flex-1 flex items-center justify-start gap-x-5 mx-4 md:mx-7">
                <button
                    className="cursor-pointer p-2 hover:bg-gray-100 bg-white shadow-md rounded-lg transition-colors"
                    onClick={toggleSidebar}
                >
                    <Menu className="size-5 text-thirdary" />
                </button>
                <div>
                    <header className="hidden md:block text-secondary text-xl">Dashboards</header>
                    <span className="text-gray-500 text-sm md:block hidden">Centro de Atención Integral para la Discapacidad</span>
                </div>
            </div>

            {/* Second */}
            <div className="flex-1 flex justify-end items-center gap-x-5 mr-4 md:mr-10">
                {/* Notificaciones */}
                <div className="relative animate-fade-in animate-delay-200 z-50" ref={notificationsRef}>
                    <button className={`duration-200 relative cursor-pointer bg-white hover:bg-gray-50 rounded-xl w-10 h-10 flex items-center justify-center transition-colors border-2 border-white p-1 ${showNotifications ? 'bg-accent' : 'hover:bg-accent/50'}`} onClick={handleToggleNotifications}>
                        <Bell className="size-5 text-thirdary" id="notification" />
                        {/* Badge con número - solo visible si hay notificaciones */}
                        {notifications.length > 0 && (
                            <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-[10px] font-semibold text-white">{notifications.length}</span>
                            </div>
                        )}
                    </button>

                    {/* Panel de notificaciones */}
                    {showNotifications && (
                        <div className={`absolute top-12 right-0 w-[calc(100vw-2rem)] max-w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20 transition-all duration-300 ${isClosing ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-gray-800">Notificaciones</h3>
                                    <span className="text-xs text-gray-500">
                                        {notifications.length > 0 ? `${notifications.length} nuevas` : 'Sin alertas'}
                                    </span>
                                </div>

                                {notifications.length > 0 ? (
                                    <>
                                        <div className="space-y-3 max-h-64 overflow-y-auto">
                                            {notifications.map((notification) => (
                                                <div key={notification.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg ">
                                                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notification.priority === 'high' ? 'bg-red-500' : notification.priority === 'medium' ? 'bg-primary' : 'bg-gray-400'}`}></div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-800 line-clamp-2">
                                                            {notification.title}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {notification.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <button className="w-full text-center text-sm text-primary hover:text-primary/80 font-medium cursor-pointer">
                                                Ver todas las notificaciones
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                            <Bell className="size-6 text-gray-400" />
                                        </div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">
                                            No hay alertas disponibles
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Todo está funcionando correctamente
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Perfil - Solo visible cuando sidebar está cerrado */}
                <div
                    className={`z-50 transition-all duration-500 ease-in-out ${!isSidebarOpen
                        ? 'opacity-100 translate-x-0 w-auto'
                        : 'opacity-0 translate-x-4 w-0'
                        }`}
                >
                    <div className="relative" ref={profileMenuRef}>
                        <button
                            onClick={handleToggleProfileMenu}
                            className="cursor-pointer p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center border-2 border-white">
                                <Image
                                    className="rounded-lg object-cover w-full h-full"
                                    src="/Profile.png"
                                    alt="Perfil"
                                    width={40}
                                    height={40}
                                />
                            </div>
                        </button>

                        {showProfileMenu && (
                            <div
                                className={`absolute top-14 right-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 transition-all duration-300 ${isClosingProfile ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                                    }`}
                            >
                                <div className="p-2">
                                    <button className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors text-left cursor-pointer">
                                        <User className="size-4 text-gray-600" />
                                        <span className="text-sm text-gray-700">Mi Perfil</span>
                                    </button>
                                    <button className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors text-left cursor-pointer">
                                        <Settings className="size-4 text-gray-600" />
                                        <span className="text-sm text-gray-700">Configuración</span>
                                    </button>
                                    <hr className="my-2" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 p-2 hover:bg-red-50 rounded-lg transition-colors text-left group cursor-pointer"
                                    >
                                        <LogOut className="size-4 text-red-600" />
                                        <span className="text-sm text-red-600 font-medium">Salir</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

