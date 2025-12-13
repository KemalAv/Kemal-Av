import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.tsx';
import Sidebar from './components/Sidebar.tsx';
import CodeEditor from './components/CodeEditor.tsx';
import OutputDisplay from './components/OutputDisplay.tsx';
import type { OutputData } from './types';
import { getExampleCode, ExampleType } from './utils/examples';
import { PYTHON_RUNNER_SCRIPT } from './utils/pythonRunner';

// Declare pyodide and @hpcc-js/wasm loading status on the window object
declare global {
  interface Window {
    loadPyodide: (config?: any) => Promise<any>;
    pyodide: any;
  }
}

const App: React.FC = () => {
  const [pyodide, setPyodide] = useState<any | null>(null);
  const [pyodideLoadingState, setPyodideLoadingState] = useState<string>("Loading Python environment...");
  const [code, setCode] = useState<string>(getExampleCode('matplotlib'));
  const [output, setOutput] = useState<OutputData | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    const loadPyodide = async () => {
      try {
        const pyodideInstance = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/"
        });
        
        setPyodideLoadingState("Loading core packages (numpy, pandas, matplotlib)...");
        await pyodideInstance.loadPackage(['numpy', 'pandas', 'matplotlib']);
        
        setPyodideLoadingState("Loading scientific packages (scikit-learn, scipy, statsmodels)...");
        await pyodideInstance.loadPackage(['scikit-learn', 'scipy', 'statsmodels']);

        setPyodideLoadingState("Loading visualization packages (seaborn, networkx)...");
        await pyodideInstance.loadPackage("micropip");
        const micropip = pyodideInstance.pyimport("micropip");
        // Install additional packages without specifying pyparsing version to avoid conflicts.
        await micropip.install(['seaborn', 'networkx']);

        setPyodideLoadingState("Loading emoji font support...");
        try {
            const fontResponse = await fetch('https://cdn.jsdelivr.net/npm/noto-color-emoji@2.0.3/fonts/NotoColorEmoji.ttf');
            if (!fontResponse.ok) {
                throw new Error(`Failed to fetch font: ${fontResponse.statusText}`);
            }
            const fontBuffer = await fontResponse.arrayBuffer();
            pyodideInstance.FS.writeFile('/NotoColorEmoji.ttf', new Uint8Array(fontBuffer), { encoding: 'binary' });
        } catch (fontError) {
            console.warn("Could not load emoji font, emojis in plots may not render correctly.", fontError);
        }
        
        setPyodide(pyodideInstance);
        setPyodideLoadingState("");
      } catch (error) {
        console.error("Failed to load Pyodide or packages:", error);
        setPyodideLoadingState("Error loading Python environment. Please refresh the page.");
      }
    };
    loadPyodide();
  }, []);
  
  const handleVisualize = useCallback(async () => {
    if (!pyodide || !code.trim()) return;

    setIsRunning(true);
    setOutput(null);

    try {
      pyodide.globals.set('user_code', code);
      const result_json_string = await pyodide.runPythonAsync(PYTHON_RUNNER_SCRIPT);
      const result: OutputData = JSON.parse(result_json_string);
      setOutput(result);
    } catch (err) {
      console.error("Python execution error:", err);
      setOutput({
        type: 'error',
        data: err instanceof Error ? err.message : 'An unknown error occurred during execution.',
        logs: ''
      });
    } finally {
      setIsRunning(false);
    }
  }, [pyodide, code]);

  const handleSelectExample = (type: ExampleType) => {
    setCode(getExampleCode(type));
    setOutput(null);
  };
  
  const isLoading = !!pyodideLoadingState || isRunning;
  
  const getLoadingText = () => {
    if (pyodideLoadingState) return pyodideLoadingState;
    if (isRunning) return 'Running...';
    return '';
  };

  return (
    <div className="relative min-h-screen pb-16 bg-gray-200 text-gray-900 flex flex-col">
      <Header />
      <div className="flex-grow container mx-auto px-4 py-4 w-full flex flex-col md:flex-row gap-6">
        <Sidebar 
          onSelectExample={handleSelectExample}
        />
        <main className="flex-grow flex flex-col gap-6 w-full md:w-3/4">
          <CodeEditor
            code={code}
            setCode={setCode}
            onVisualize={handleVisualize}
            isLoading={isLoading}
            loadingText={getLoadingText()}
          />
          <OutputDisplay
            output={output}
            isLoading={isLoading}
            loadingText={getLoadingText()}
          />
        </main>
      </div>
       <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white text-center p-2 text-sm z-20 shadow-inner border-t border-gray-600">
        Help keep the code running ☕ <a href="https://ko-fi.com/kemalavicennafaza" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-300">ko-fi.com/kemalavicennafaza</a>
      </footer>
    </div>
  );
};

export default App;
