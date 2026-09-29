'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

import {
    Users,
    Key,
    Link2,
    BarChart3,
    FileText,
    Settings,
    LayoutDashboard
} from 'lucide-react'

interface NavLink {
    name: string
    href: string
    icon: React.ReactNode
    adminOnly?: boolean
}

const links: NavLink[] = [{
    name: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className='size-7' />
},
{
    name: 'Reportes',
    icon: <BarChart3 className='size-7' />,
    href: '/dashboard/reports'
}, {
    name: 'Usuarios',
    icon: <Users className='size-7' />,
    href: '/dashboard/users'
}, {
    name: 'Licencias',
    icon: <Key className='size-7' />,
    href: '/dashboard/licenses'
}, {
    name: 'Asignaciones',
    icon: <Link2 className='size-7' />,
    href: '/dashboard/assignments'
}, {
    name: 'Contratos',
    icon: <FileText className='size-7' />,
    href: '/dashboard/contracts'
}, {
    name: 'Configuración',
    icon: <Settings className='size-7' />,
    href: '/dashboard/settings',
    adminOnly: true
}]

export default function NavLinks() {
    const pathname = usePathname();
    const { isAdmin } = useAuth();

    const visibleLinks = links.filter(link => !link.adminOnly || isAdmin);

    return (
        <>
            {
                visibleLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex flex-row text-gray-500 gap-x-3 items-center px-3 py-2 rounded-lg cursor-pointer transition-colors hover:text-secondary duration-300 text-base
                                ${isActive ? 'text-secondary' : ''}
                            `}
                        >
                            {link.icon}
                            <span className='hidden md:block'>{link.name}</span>
                        </Link>
                    );
                })
            }
        </>
    )
}