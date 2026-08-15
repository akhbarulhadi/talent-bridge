import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navigation Bar */}
      <header className="bg-white shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          {/* Logo / Brand Name */}
          <div className="text-2xl font-extrabold text-blue-600 tracking-tight">
            Talent Bridge
          </div>
          
          {/* Login Button */}
          <div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 lg:py-32">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Bangun Koneksi Menuju</span>
            <span className="block text-blue-600 mt-2">Karier Masa Depan</span>
          </h1>
          
          <p className="mt-4 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-6 md:text-xl md:max-w-3xl">
            Talent Bridge menghubungkan talenta-talenta terbaik dengan perusahaan impian. Tingkatkan potensi Anda dan temukan peluang tak terbatas bersama kami.
          </p>
          
          <div className="mt-8 max-w-md mx-auto sm:flex sm:justify-center md:mt-10 gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg transition-colors duration-200 shadow-md"
            >
              Mulai Sekarang
            </Link>
            <Link
              href="/about"
              className="w-full sm:w-auto mt-3 sm:mt-0 flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg transition-colors duration-200 shadow-sm"
            >
              Pelajari Lebih Lanjut
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Talent Bridge. All rights reserved.
          </div>
          <div className="mt-4 md:mt-0 flex space-x-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}