import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
          Mr. X Game
        </h1>
        <p className="text-xl mb-8 text-gray-400">
          Scotland Yard Web Implementation
        </p>

        <div className="space-y-4">
          <div className="bg-gray-800 p-8 rounded-lg border-2 border-gray-700">
            <p className="text-2xl mb-4">Setup Counter: {count}</p>
            <button
              onClick={() => setCount((count) => count + 1)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Click to Test
            </button>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border-2 border-gray-700 max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-3 text-cyan-400">Next Steps:</h2>
            <ol className="text-left space-y-2 text-gray-300">
              <li>✅ Project structure created</li>
              <li>⏳ Install dependencies: <code className="bg-gray-900 px-2 py-1 rounded">pnpm install</code></li>
              <li>⏳ Get Mapbox token and add to .env</li>
              <li>⏳ Download Scotland Yard data</li>
              <li>⏳ Start implementing Phase 1</li>
            </ol>
          </div>
        </div>

        <p className="mt-8 text-gray-500">
          Check README.md for detailed setup instructions
        </p>
      </div>
    </div>
  )
}

export default App
