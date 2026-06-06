import Navbar from '@/components/admin/Navbar'
import Sidebar from '@/components/admin/Sidebar'

export const metadata = {
    title: 'Admin Portal - Vehicle Management System',
    description: 'Admin portal for managing vehicles and system settings',
}

export default function AdminLayout({ children }) {
    return (
        <div className='flex'>
            <div>
                <Sidebar/>
            </div>
        <div className="min-h-screen bg-gray-50 w-[100%]">
            <Navbar />
            <main>
                {children}
            </main>
        </div>
        </div>
    )
}
