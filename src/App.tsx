function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm py-4 px-6">
        <h1 className="text-2xl font-bold text-gray-800">Digital Twin</h1>
        <nav className="mt-2">
          {/* Add static navigation links here */}
          <ul className="flex gap-4 flex-wrap">
            <li><a href="#model" className="text-sm sm:text-base text-gray-700 hover:text-blue-600 font-medium">Model Selection</a></li>
            <li><a href="#simulation" className="text-sm sm:text-base text-gray-700 hover:text-blue-600 font-medium">Simulation</a></li>
            <li><a href="#history" className="text-sm sm:text-base text-gray-700 hover:text-blue-600 font-medium">History/Charts</a></li>
            <li><a href="#logs" className="text-sm sm:text-base text-gray-700 hover:text-blue-600 font-medium">Logs</a></li>
          </ul>
        </nav>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-8">
        {/* Make this container responsive */}
        <div className="w-full max-w-3xl bg-white rounded-md shadow-sm p-6 mx-auto mt-8">
          <p className="text-gray-600 text-center">Welcome!</p>
        </div>
      </main>
    </div>
  );
}

export default App
