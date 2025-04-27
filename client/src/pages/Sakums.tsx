
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Sakums() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Sveicināti ImageShare</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300">
            Laipni lūdzam ImageShare - vietā, kur jūs varat dalīties ar saviem mīļākajiem attēliem un 
            atklāt citu lietotāju radošos darbus.
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
