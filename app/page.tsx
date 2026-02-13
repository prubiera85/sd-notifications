import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
          Notificaciones Service Desk
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Monitoreo en tiempo real de comentarios en Linear con menciones al Service Desk
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          Ir al Dashboard
        </Link>
      </div>
    </div>
  );
}
