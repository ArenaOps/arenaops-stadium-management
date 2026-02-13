
import Link from 'next/link';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar Placeholder */}
            <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-white md:flex">
                <div className="flex h-16 items-center border-b px-6">
                    <Link href="/" className="text-xl font-bold text-gray-900">ArenaOps</Link>
                </div>
                <nav className="flex-1 space-y-1 px-4 py-4">
                    <Link href="/stadiums" className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                        Stadiums
                    </Link>
                    <Link href="/events" className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                        Events
                    </Link>
                    <Link href="/bookings" className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                        My Bookings
                    </Link>
                    <div className="pt-4">
                        <h3 className="px-3 text-xs font-semibold uppercase text-gray-500">Admin</h3>
                        <Link href="/admin" className="mt-1 block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                            Dashboard
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:pl-64">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
