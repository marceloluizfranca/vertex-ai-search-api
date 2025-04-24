import Chat from "@/components/Chat";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-indigo-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="py-4 px-6 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-center text-indigo-600 dark:text-indigo-400">
          SRE-AI Assistant
        </h1>
      </header>
      
      <main className="flex-grow container mx-auto max-w-4xl px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden h-[80vh]">
          <Chat />
        </div>
      </main>
      
      <footer className="py-3 px-6 text-center text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <p>© {new Date().getFullYear()} SRE-AI Assistant</p>
      </footer>
    </div>
  );
}