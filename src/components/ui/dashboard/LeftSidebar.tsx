'use client'

import NavLinks from '@/components/ui/dashboard/nav-links';
import { AppLogo } from '@/components/brand/AppLogo';
import { UserAvatar } from '@/components/auth/UserAvatar';
import { useState, useEffect, useRef } from 'react';
import { LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


export default function LeftSidebar() {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { logout, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current &&
                !menuRef.current.contains(event.target as Node)) {
                setIsClosing(true);
                setTimeout(() => {
                    setShowProfileMenu(false);
                    setIsClosing(false);
                }, 300);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggleMenu = () => {
        if (showProfileMenu) {
            setIsClosing(true);
            setTimeout(() => {
                setShowProfileMenu(false);
                setIsClosing(false);
            }, 300);
        } else {
            setShowProfileMenu(true);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    return (
        <div className="w-20 md:w-56 h-screen flex flex-col justify-between items-center border-r border-gray-200">
            {/* Perfil */}
            <div className="flex flex-col justify-center md:justify-start items-start mt-10">
                <div className='relative' ref={menuRef}>
                    <button type="button"
                        onClick={handleToggleMenu}
                        className='flex flex-row gap-2 justify-center items-center px-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer py-2'
                    >
                        <UserAvatar name={user?.name} image={user?.image} />
                        <span className="hidden md:block text-thirdary max-w-32 truncate">
                            {user?.displayUsername ?? user?.name ?? "Usuario"}
                        </span>
                    </button>

                    {/* Menú del perfil */}
                    {showProfileMenu && (
                        <div className={`absolute top-14 left-2 md:left-0 w-12 md:w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 transition-all animate-in fade-in duration-200 ${isClosing ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
                            <div className="p-2">
                                <button type="button" className="w-full flex items-center justify-center md:justify-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors text-left cursor-pointer" disabled>
                                    <User className="size-4 text-gray-600" />
                                    <span className="text-sm text-gray-700 hidden md:inline">Mi Perfil</span>
                                </button>
                                <Link href="/dashboard/settings" className="w-full flex items-center justify-center md:justify-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors text-left cursor-pointer">
                                    <Settings className="size-4 text-gray-600" />
                                    <span className="text-sm text-gray-700 hidden md:inline">Configuración</span>
                                </Link>
                                <hr className="my-2" />
                                <button type="button"
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center md:justify-start gap-3 p-2 hover:bg-red-50 rounded-lg transition-colors text-left group cursor-pointer"
                                >
                                    <LogOut className="size-4 text-red-600" />
                                    <span className="text-sm text-red-600 font-medium hidden md:inline">Salir</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Dashboards */}
                <nav className='mt-7 flex flex-col'>
                    <ul className='space-y-10 md:space-y-2 mt-5 flex flex-col justify-center items-center md:items-start'>
                        <NavLinks />
                    </ul>
                </nav>

            </div>


            {/* Pages */}
            <div className='flex flex-col justify-center items-center mt-10 mb-2'>
                <AppLogo showText className='hidden md:flex' />
                <AppLogo size='sm' className='md:hidden' />
                <span className='mt-1 text-center text-sm text-gray-500'>Version 1.1.1</span>
            </div>
        </div>
    )
}

