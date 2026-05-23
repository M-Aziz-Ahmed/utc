import Navbar from '@/components/admin/Navbar'

export const metadata = {
    title: 'Admin Portal - Vehicle Management System',
    description: 'Admin portal for managing vehicles and system settings',
}

export default function AdminLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main>
                {children}
            </main>
        </div>
    )
}
