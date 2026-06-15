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
        <div className='flex'>
            <div>
                <Sidebar />
            </div>
            <div className="min-h-screen bg-gray-50 w-full">
                <Navbar user={user} />
                <main>
                    {children}
                </main>
            </div>
        </div>
    )
}
