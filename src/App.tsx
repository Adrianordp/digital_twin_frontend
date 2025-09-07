import React from 'react';
import ModelSelector from './components/ModelSelector';
import SimulationInitializer from './components/SimulationInitializer';
import StateDisplay from './components/StateDisplay';
import SimulationControls from './components/SimulationControls';
import SimulationChartContainer from './components/SimulationChartContainer';
import { SessionProvider } from './context/SessionContext';
import { useSession } from './context/useSession';

function InnerApp() {
  const { selectedModel, setSelectedModel, sessionId, setSessionId } = useSession();
  const [refreshSignal, setRefreshSignal] = React.useState<number>(0);
  const [chartRefreshTrigger, setChartRefreshTrigger] = React.useState<number>(0);

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
        <div id="model" className="w-full max-w-3xl bg-white rounded-md shadow-sm p-6 mx-auto mt-8">
          <ModelSelector value={selectedModel} onChange={setSelectedModel} />
          <div className="mt-4 text-sm text-gray-600">Selected model: {selectedModel}</div>
        </div>

        <div id="simulation" className="w-full max-w-3xl bg-white rounded-md shadow-sm p-6 mx-auto mt-6">
          <h2 className="text-lg font-semibold text-gray-800">Simulation</h2>
          <div className="mt-2 space-y-4">
            <SimulationInitializer modelName={selectedModel} onInit={(id) => setSessionId(id)} />
            <p className="text-sm text-gray-600 mt-2">Simulation controls will appear after initialization.</p>
            {sessionId && <div className="mt-2 text-sm text-green-600">Active session: {sessionId}</div>}
            {sessionId && (
              <div className="mt-2">
                <SimulationControls
                  sessionId={sessionId}
                  selectedModel={selectedModel}
                  onRefresh={() => setRefreshSignal((s) => s + 1)}
                  onChartRefresh={() => setChartRefreshTrigger((s) => s + 1)}
                />
              </div>
            )}
            <div className="mt-4">
              <StateDisplay sessionId={sessionId} refreshSignal={refreshSignal} />
            </div>
          </div>
        </div>

        {/* Separate chart section to prevent flickering */}
        {sessionId && (
          <div id="history" className="w-full max-w-3xl bg-white rounded-md shadow-sm p-6 mx-auto mt-6">
            <h2 className="text-lg font-semibold text-gray-800">Simulation History</h2>
            <div className="mt-4">
              <SimulationChartContainer refreshTrigger={chartRefreshTrigger} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <SessionProvider>
      <InnerApp />
    </SessionProvider>
  );
}

export default App
