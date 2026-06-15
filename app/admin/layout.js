import Navbar from '@/components/admin/Navbar'
import Sidebar from '@/components/admin/Sidebar'
import Me from '@/app/hooks/Me'
import { redirect } from 'next/navigation'

export const metadata = {
    title: 'Admin Portal - Vehicle Management System',
    description: 'Admin portal for managing vehicles and system settings',
}

export default async function AdminLayout({ children }) {
    const { user } = await Me()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar — fixed height, never scrolls */}
            <Sidebar />

            {/* Main area — takes remaining width, scrolls vertically */}
            <div className="flex flex-col flex-1 min-w-0 overflow-y-auto bg-gray-50">
                <Navbar user={user} />
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    )
}
