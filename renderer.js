const { useState, useEffect, useRef } = React;

// --- Initial Data ---
const themes = [
  { name: 'Chroma Wave', url: 'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
  { name: 'Neon Grid', url: 'https://images.pexels.com/photos/2150/sky-space-dark-galaxy.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
  { name: 'Cosmic Dust', url: 'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
  { name: 'Solar Flare', url: 'https://images.pexels.com/photos/39561/solar-flare-sun-eruption-energy-39561.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
  { name: 'Serene Mountain', url: 'https://images.pexels.com/photos/572897/pexels-photo-572897.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
  { name: 'Azure Dream', url: 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
];

// --- Main App Component ---
function App() {
  const [currentTheme, setCurrentTheme] = useState(themes[0].url);
  const [activeTab, setActiveTab] = useState('Executor');
  const [scriptContent, setScriptContent] = useState(
`print("glassy")`
  );
  const [isConnected, setIsConnected] = useState(false);
  const [connectedPort, setConnectedPort] = useState(null);
  const [consoleOutput, setConsoleOutput] = useState([
    { message: 'Welcome to Opiumware Executor v1.0', type: 'info' },
    { message: 'Ready to execute scripts...', type: 'info' }
  ]);
  const [scripts, setScripts] = useState([]);
  const [currentScript, setCurrentScript] = useState(null);
  const [selectedPort, setSelectedPort] = useState('8392');
  const [enableWebSocket, setEnableWebSocket] = useState(false);
  const [autoAttachEnabled, setAutoAttachEnabled] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveScriptName, setSaveScriptName] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const tabs = ['Executor', 'Scripts', 'Settings', 'Themes'];

  // Initialize on mount
  useEffect(() => {
    loadScripts();
    initializeEventListeners();
  }, []);

  const initializeEventListeners = () => {
    // Window controls
    document.addEventListener('keydown', handleKeyboardShortcuts);
  };

  const handleKeyboardShortcuts = (event) => {
    // Ctrl+S to save
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      handleSaveScript();
    }
    
    // Ctrl+Enter to execute
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      handleExecuteScript();
    }
    
    // Ctrl+N for new script
    if (event.ctrlKey && event.key === 'n') {
      event.preventDefault();
      handleNewScript();
    }
    
    // Ctrl+O to open file
    if (event.ctrlKey && event.key === 'o') {
      event.preventDefault();
      handleOpenFile();
    }
  };

  const logToConsole = (message, type = 'info') => {
    setConsoleOutput(prev => [...prev, { 
      message: `[${new Date().toLocaleTimeString()}] ${message}`, 
      type 
    }]);
  };

  const loadScripts = async () => {
    try {
      const result = await window.electronAPI.getScripts();
      setScripts(result);
    } catch (error) {
      logToConsole('Failed to load scripts: ' + error.message, 'error');
    }
  };

  const handleAutoAttach = async () => {
    try {
      logToConsole('Attempting to auto-attach...', 'info');
      const result = await window.electronAPI.autoAttach();
      
      if (result.startsWith('Failed')) {
        logToConsole('Auto-attach failed: ' + result, 'error');
        setIsConnected(false);
        setConnectedPort(null);
      } else {
        // Force update connection state
        setConnectedPort(result);
        setSelectedPort(result);
        setIsConnected(true);
        
        logToConsole(`Successfully connected to port ${result}`, 'success');
        logToConsole(`Connection state updated: isConnected=${true}, port=${result}`, 'info');
        
        // Force a re-render by updating state again
        setTimeout(() => {
          setIsConnected(true);
          setConnectedPort(result);
        }, 100);
      }
    } catch (error) {
      logToConsole('Auto-attach error: ' + error.message, 'error');
      setIsConnected(false);
      setConnectedPort(null);
    }
  };

  const handleExecuteScript = async () => {
    const code = scriptContent.trim();
    console.log('=== EXECUTE FUNCTION CALLED ===');
    console.log('Script content:', code);
    console.log('Is connected:', isConnected);
    console.log('Connected port:', connectedPort);
    logToConsole(`Execute button clicked. isConnected=${isConnected}, connectedPort=${connectedPort}`, 'info');
    if (!code) {
      logToConsole('No script to execute', 'error');
      return;
    }
    if (!isConnected) {
      logToConsole('Not connected to any port', 'error');
      return;
    }
    setIsExecuting(true);
    try {
      logToConsole(`Executing script on port ${connectedPort}...`, 'info');
      logToConsole(`Script content: ${code}`, 'info');
      // Send setting first
      await window.electronAPI.OpiumwareExecution({
        code: "OpiumwareSetting EnableWS true",
        port: connectedPort
      });
      // Send main script
      const result = await window.electronAPI.OpiumwareExecution({
        code: "OpiumwareScript " + code,
        port: connectedPort
      });
      console.log('API result:', result);
      if (result && result.startsWith('Successfully')) {
        logToConsole('Script executed successfully', 'success');
        logToConsole('Check Roblox console (F9) for output', 'info');
      } else {
        logToConsole('Script execution failed: ' + result, 'error');
      }
    } catch (error) {
      console.error('Execution error:', error);
      logToConsole('Execution error: ' + error.message, 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleClearScript = () => {
    if (confirm('Are you sure you want to clear the script?')) {
      setScriptContent('');
      logToConsole('Script cleared', 'info');
    }
  };

  const handleNewScript = () => {
    setScriptContent('');
    setCurrentScript(null);
    logToConsole('Created new script', 'info');
  };



  const handleOpenFile = async () => {
    try {
      const result = await window.electronAPI.openFileDialog();
      if (result.success) {
        setScriptContent(result.content);
        setCurrentScript(result.filename);
        logToConsole(`Opened file: ${result.filename}`, 'success');
      } else {
        logToConsole('Failed to open file: ' + result.message, 'error');
      }
    } catch (error) {
      logToConsole('Open file error: ' + error.message, 'error');
    }
  };

  const handleSaveScript = async () => {
    setSaveScriptName(currentScript || '');
    setShowSaveModal(true);
  };

  const confirmSaveScript = async () => {
    const name = saveScriptName.trim();
    if (!name) {
      alert('Please enter a script name');
      return;
    }
    
    const content = scriptContent;
    if (!content.trim()) {
      alert('Please enter some code to save');
      return;
    }
    
    try {
      const result = await window.electronAPI.saveScript({ name, content });
      if (result.success) {
        setCurrentScript(name);
        logToConsole(`Saved script: ${name}`, 'success');
        await loadScripts();
        setShowSaveModal(false);
        setSaveScriptName('');
      } else {
        logToConsole('Failed to save script: ' + result.message, 'error');
      }
    } catch (error) {
      logToConsole('Save error: ' + error.message, 'error');
    }
  };

  const handleLoadScript = async (name) => {
    try {
      const result = await window.electronAPI.loadScript(name);
      if (result.success) {
        setScriptContent(result.content);
        setCurrentScript(name);
        logToConsole(`Loaded script: ${name}`, 'success');
      } else {
        logToConsole('Failed to load script: ' + result.message, 'error');
      }
    } catch (error) {
      logToConsole('Load error: ' + error.message, 'error');
    }
  };

  const handleDeleteScript = async (name) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        const result = await window.electronAPI.deleteScript(name);
        if (result.success) {
          logToConsole(`Deleted script: ${name}`, 'success');
          await loadScripts();
        } else {
          logToConsole('Failed to delete script: ' + result.message, 'error');
        }
      } catch (error) {
        logToConsole('Delete error: ' + error.message, 'error');
      }
    }
  };

  const clearConsole = () => {
    setConsoleOutput([]);
    logToConsole('Console cleared', 'info');
  };

  const handlePortChange = async (port) => {
    setSelectedPort(port);
    try {
      const isOpen = await window.electronAPI.checkPortStatus(port);
      if (isOpen) {
        logToConsole(`Port ${port} is available`, 'success');
      } else {
        logToConsole(`Port ${port} is not available`, 'error');
      }
    } catch (error) {
      logToConsole(`Error checking port ${port}: ${error.message}`, 'error');
    }
  };

  const handleManualConnect = async () => {
    try {
      logToConsole(`Attempting to connect to port ${selectedPort}...`, 'info');
      const result = await window.electronAPI.connectAndSend({
        code: "NULL",
        port: selectedPort
      });
      
      if (result.startsWith('Successfully connected')) {
        setConnectedPort(selectedPort);
        setIsConnected(true);
        logToConsole(`Successfully connected to port ${selectedPort}`, 'success');
      } else {
        setIsConnected(false);
        setConnectedPort(null);
        logToConsole(`Failed to connect to port ${selectedPort}`, 'error');
      }
    } catch (error) {
      setIsConnected(false);
      setConnectedPort(null);
      logToConsole(`Connection error: ${error.message}`, 'error');
    }
  };

  return (
    <div
      className="w-full h-screen bg-cover bg-center transition-all duration-1000 font-sans"
      style={{ backgroundImage: `url('${currentTheme}')` }}
    >
      <div className="w-full h-full bg-black/20 backdrop-blur-xl overflow-hidden flex flex-col">
        <div className="flex-shrink-0 flex items-center justify-between px-4 pt-4" style={{ WebkitAppRegion: 'drag' }}>
          <TrafficLights />
          <div className="flex-grow flex items-center justify-center">
             <TabBar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          <div className="w-14"></div>
        </div>

        <div className="flex-grow p-4 flex flex-col min-h-0" style={{ WebkitAppRegion: 'no-drag' }}>
           {activeTab === 'Executor' && (
             <ScriptEditor 
               scriptContent={scriptContent} 
               setScriptContent={setScriptContent}
               isConnected={isConnected}
               connectedPort={connectedPort}
               onExecute={handleExecuteScript}
               onClear={handleClearScript}
               onOpenFile={handleOpenFile}
               onSave={handleSaveScript}
               consoleOutput={consoleOutput}
               onClearConsole={clearConsole}
               isExecuting={isExecuting}
               onConnect={handleManualConnect}
             />
           )}
           {activeTab === 'Scripts' && (
             <ScriptsPanel 
               scripts={scripts}
               onLoadScript={handleLoadScript}
               onDeleteScript={handleDeleteScript}
               onNewScript={handleNewScript}
               onOpenFile={handleOpenFile}
               onSave={handleSaveScript}
             />
           )}
           {activeTab === 'Settings' && (
             <SettingsPanel 
               selectedPort={selectedPort}
               setSelectedPort={setSelectedPort}
               enableWebSocket={enableWebSocket}
               setEnableWebSocket={setEnableWebSocket}
               autoAttachEnabled={autoAttachEnabled}
               setAutoAttachEnabled={setAutoAttachEnabled}
               onAutoAttach={handleAutoAttach}
             />
           )}
           {activeTab === 'Themes' && <ThemesPanel setCurrentTheme={setCurrentTheme} />}
        </div>
      </div>
      
      {/* Save Script Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black/30 backdrop-blur-xl rounded-xl p-6 ring-1 ring-white/10 max-w-md w-full mx-4">
            <h3 className="text-white/90 font-semibold text-lg mb-4">Save Script</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Script Name
                </label>
                <input
                  type="text"
                  value={saveScriptName}
                  onChange={(e) => setSaveScriptName(e.target.value)}
                  className="w-full bg-black/20 text-white/90 px-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:border-white/40 transition-colors"
                  placeholder="Enter script name"
                  autoFocus
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 bg-white/10 text-white/70 hover:bg-white/20 py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSaveScript}
                  className="flex-1 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 py-2 px-4 rounded-lg transition-colors font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- UI Components ---
const TrafficLights = () => (
  <div className="flex space-x-2" style={{ WebkitAppRegion: 'no-drag' }}>
    <button 
      onClick={() => window.electronAPI.closeWindow()}
      className="w-3.5 h-3.5 bg-[#FF5F57] rounded-full hover:bg-[#FF4444] transition-colors"
    ></button>
    <button 
      onClick={() => window.electronAPI.minimizeWindow()}
      className="w-3.5 h-3.5 bg-[#FEBC2E] rounded-full hover:bg-[#FFD700] transition-colors"
    ></button>
    <button 
      onClick={() => window.electronAPI.maximizeWindow()}
      className="w-3.5 h-3.5 bg-[#28C840] rounded-full hover:bg-[#32CD32] transition-colors"
    ></button>
  </div>
);

const TabBar = ({ tabs, activeTab, setActiveTab }) => (
  <div className="flex items-center bg-black/10 p-1 rounded-full" style={{ WebkitAppRegion: 'no-drag' }}>
    {tabs.map((tab) => (
      <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        className={`relative px-5 py-1.5 text-sm font-medium rounded-full transition-all duration-300 ease-in-out outline-none
          ${activeTab === tab ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
      >
        {activeTab === tab && (
          <div className="absolute inset-0 bg-white/20 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)]"></div>
        )}
        <span className="relative z-10">{tab}</span>
      </button>
    ))}
  </div>
);

const ActionButton = ({ icon: Icon, label, primary = false, onClick, disabled = false }) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-md transition-all duration-200 group
            ${primary 
                ? 'bg-green-400/20 text-green-300 hover:bg-green-400/30 hover:shadow-[0_0_15px_rgba(74,222,128,0.3)]' 
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
        <Icon className="w-4 h-4" />
        <span className="text-xs font-semibold">{label}</span>
    </button>
);

// --- Main Panels ---
const ScriptEditor = ({ 
  scriptContent, 
  setScriptContent, 
  isConnected, 
  connectedPort,
  onExecute,
  onClear,
  onOpenFile,
  onSave,
  consoleOutput,
  onClearConsole,
  isExecuting,
  onConnect
}) => (
    <div className="flex-grow flex flex-col space-y-4">


        {/* Connection Status */}
        <div className="flex items-center justify-between bg-black/20 rounded-xl p-3 ring-1 ring-white/10 mb-4">
            <div className="flex items-center space-x-3">
                <div className={`flex items-center space-x-2 ${isConnected ? 'text-green-300' : 'text-red-300'}`}>
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className="text-sm font-medium">
                        {isConnected ? `Connected (${connectedPort})` : 'Disconnected'}
                    </span>
                </div>
                {!isConnected && (
                    <span className="text-white/50 text-xs">Click Connect to establish connection</span>
                )}
            </div>
            <div className="flex items-center space-x-2">
                {!isConnected ? (
                    <button 
                        onClick={onConnect}
                        className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 px-3 py-1 rounded text-xs font-medium transition-colors"
                    >
                        Connect
                    </button>
                ) : (
                    <div className="text-green-300 text-xs font-medium">
                        Ready to execute
                    </div>
                )}
            </div>
        </div>

        {/* Script Editor */}
        <div className="flex-grow flex flex-col bg-black/20 rounded-xl overflow-hidden ring-1 ring-white/10">
            <textarea
                value={scriptContent}
                onChange={(e) => setScriptContent(e.target.value)}
                className="w-full h-full p-4 bg-transparent text-white/90 font-mono text-sm resize-none focus:outline-none placeholder-white/30 selection:bg-blue-500/50"
                placeholder="-- Paste your script here..."
                spellCheck="false"
            />
            <div className="flex items-center justify-between p-2 bg-black/20 border-t border-white/10">
                <div className="flex items-center space-x-1">
                    <button 
                        onClick={() => {
                            console.log('Execute button clicked!');
                            if (isConnected) {
                                onExecute();
                            } else {
                                alert('Please connect first!');
                            }
                        }}
                        disabled={isExecuting}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-md transition-all duration-200 group
                            ${isConnected && !isExecuting
                                ? 'bg-green-400/20 text-green-300 hover:bg-green-400/30 hover:shadow-[0_0_15px_rgba(74,222,128,0.3)]' 
                                : isExecuting
                                ? 'bg-blue-400/20 text-blue-300'
                                : 'bg-gray-400/20 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {isExecuting ? (
                            <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Play className="w-4 h-4" />
                        )}
                        <span className="text-xs font-semibold">
                            {isExecuting ? 'Executing...' : 'Execute'}
                        </span>
                    </button>
                    <ActionButton icon={Eraser} label="Clear" onClick={onClear} />
                </div>
                <div className="flex items-center space-x-1">
                    <ActionButton icon={FolderOpen} label="Open File" onClick={onOpenFile} />
                    <ActionButton icon={Save} label="Save" onClick={onSave} />
                </div>
            </div>
        </div>



        {/* Console Output */}
        <div className="bg-black/20 rounded-xl overflow-hidden ring-1 ring-white/10">
            <div className="flex items-center justify-between p-2 bg-black/20 border-b border-white/10">
                <h3 className="text-white/80 font-semibold text-sm">Console Output</h3>
                <button 
                    onClick={onClearConsole}
                    className="text-white/60 hover:text-white text-xs"
                >
                    Clear
                </button>
            </div>
            <div className="max-h-32 overflow-y-auto p-2">
                {consoleOutput.map((line, index) => (
                    <div key={index} className={`text-xs font-mono ${
                        line.type === 'success' ? 'text-green-300' :
                        line.type === 'error' ? 'text-red-300' :
                        line.type === 'info' ? 'text-blue-300' :
                        'text-white/70'
                    }`}>
                        {line.message}
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const ScriptsPanel = ({ 
  scripts, 
  onLoadScript, 
  onDeleteScript, 
  onNewScript, 
  onOpenFile, 
  onSave 
}) => (
    <div className="flex-grow flex flex-col text-white/90 p-6 overflow-y-auto">
        <div className="text-center mb-8 flex-shrink-0">
            <FileCode className="mx-auto w-12 h-12 opacity-30" />
            <h2 className="mt-2 text-xl font-bold text-white/80">Scripts</h2>
            <p className="mt-1 text-sm text-white/60">Manage your saved scripts</p>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-4">
                <ActionButton 
                    icon={Plus} 
                    label="New Script" 
                    primary 
                    onClick={onNewScript}
                />
                <ActionButton 
                    icon={FolderOpen} 
                    label="Open File" 
                    onClick={onOpenFile}
                />
                <ActionButton 
                    icon={Save} 
                    label="Save Current" 
                    onClick={onSave}
                />
            </div>
            
            {/* Scripts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scripts.map((script) => (
                    <div key={script} className="bg-black/20 rounded-xl p-4 ring-1 ring-white/10 hover:ring-white/20 transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-white/90 font-semibold truncate">{script}</h3>
                            <div className="flex space-x-2">
                                <button 
                                    onClick={() => onLoadScript(script)}
                                    className="text-blue-300 hover:text-blue-200 text-xs px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                                >
                                    Load
                                </button>
                                <button 
                                    onClick={() => onDeleteScript(script)}
                                    className="text-red-300 hover:text-red-200 text-xs px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                        <div className="text-white/50 text-xs">
                            Script • {new Date().toLocaleDateString()}
                        </div>
                    </div>
                ))}
                {scripts.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <FileCode className="mx-auto w-16 h-16 opacity-20 mb-4" />
                        <h3 className="text-white/60 font-semibold mb-2">No Saved Scripts</h3>
                        <p className="text-white/40 text-sm">Create your first script to get started</p>
                    </div>
                )}
            </div>
        </div>
    </div>
);

const SettingsPanel = ({ 
  selectedPort, 
  setSelectedPort, 
  enableWebSocket, 
  setEnableWebSocket, 
  autoAttachEnabled, 
  setAutoAttachEnabled,
  onAutoAttach 
}) => (
    <div className="flex-grow flex flex-col text-white/90 p-6 overflow-y-auto">
        <div className="text-center mb-8 flex-shrink-0">
            <Settings className="mx-auto w-12 h-12 opacity-30" />
            <h2 className="mt-2 text-xl font-bold text-white/80">Settings</h2>
            <p className="mt-1 text-sm text-white/60">Configure your executor preferences</p>
        </div>
        
        <div className="max-w-md mx-auto space-y-6">
            {/* Connection Settings */}
            <div className="bg-black/20 rounded-xl p-6 ring-1 ring-white/10">
                <h3 className="text-white/80 font-semibold mb-4 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Connection Settings</span>
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">
                            Default Port
                        </label>
                        <select 
                            value={selectedPort} 
                            onChange={(e) => setSelectedPort(e.target.value)}
                            className="w-full bg-black/20 text-white/90 px-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:border-white/40 transition-colors"
                        >
                            <option value="8392">8392</option>
                            <option value="8393">8393</option>
                            <option value="8394">8394</option>
                            <option value="8395">8395</option>
                            <option value="8396">8396</option>
                            <option value="8397">8397</option>
                        </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-white/70 text-sm font-medium">Enable WebSocket</label>
                            <p className="text-white/50 text-xs mt-1">Use WebSocket for real-time communication</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={enableWebSocket}
                                onChange={(e) => setEnableWebSocket(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-black/30 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-white/70 text-sm font-medium">Auto Attach</label>
                            <p className="text-white/50 text-xs mt-1">Automatically connect on startup</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={autoAttachEnabled}
                                onChange={(e) => setAutoAttachEnabled(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-black/30 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    
                    <button 
                        onClick={onAutoAttach}
                        className="w-full bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 py-2 px-4 rounded-lg transition-colors font-medium"
                    >
                        Test Auto Attach
                    </button>
                </div>
            </div>
            
            {/* Script Settings */}
            <div className="bg-black/20 rounded-xl p-6 ring-1 ring-white/10">
                <h3 className="text-white/80 font-semibold mb-4 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Script Settings</span>
                </h3>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-white/70 text-sm font-medium">Auto Save</label>
                            <p className="text-white/50 text-xs mt-1">Automatically save scripts while typing</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                defaultChecked
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-black/30 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-white/70 text-sm font-medium">Syntax Highlighting</label>
                            <p className="text-white/50 text-xs mt-1">Enable Lua syntax highlighting</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                defaultChecked
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-black/30 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </div>
            
            {/* About */}
            <div className="bg-black/20 rounded-xl p-6 ring-1 ring-white/10">
                <h3 className="text-white/80 font-semibold mb-4 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>About</span>
                </h3>
                
                <div className="space-y-2 text-sm text-white/60">
                    <p><strong className="text-white/80">Version:</strong> 1.0.0</p>
                    <p><strong className="text-white/80">Author:</strong> Opiumware Team</p>
                    <p><strong className="text-white/80">License:</strong> MIT</p>
                </div>
            </div>
        </div>
    </div>
);

const ThemesPanel = ({ setCurrentTheme }) => (
    <div className="flex-grow flex flex-col text-white/90 p-4 overflow-y-auto">
        <div className="text-center mb-6 flex-shrink-0">
            <Palette className="mx-auto w-12 h-12 opacity-30" />
            <h2 className="mt-2 text-xl font-bold text-white/80">Select a Theme</h2>
            <p className="mt-1 text-sm text-white/60">The UI will adapt to the new background.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {themes.map((theme) => (
                <button 
                    key={theme.name}
                    onClick={() => setCurrentTheme(theme.url)}
                    className="group aspect-video rounded-lg overflow-hidden ring-1 ring-white/10 hover:ring-white/30 focus:outline-none focus:ring-2 focus:ring-white transition-all duration-300 relative"
                >
                    <img 
                        src={theme.url} 
                        alt={theme.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/600x400/27272a/FFFFFF?text=${encodeURIComponent(theme.name)}`; }}
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                        <span className="font-semibold text-sm text-white">{theme.name}</span>
                    </div>
                </button>
            ))}
        </div>
    </div>
);

// --- Icons (using Lucide React icons) ---
const Play = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <polygon points="5,3 19,12 5,21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const Eraser = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M18 13L11 20L4 13L11 6L18 13Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 22L15 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const FolderOpen = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M6 2L3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V8C21 6.9 20.1 6 19 6H12L10 4H6Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const Settings = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M12.22 2H9.78C9.24 2 8.8 2.44 8.8 2.98V4.02C8.8 4.56 9.24 5 9.78 5H12.22C12.76 5 13.2 4.56 13.2 4.02V2.98C13.2 2.44 12.76 2 12.22 2Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18.22 2H15.78C15.24 2 14.8 2.44 14.8 2.98V4.02C14.8 4.56 15.24 5 15.78 5H18.22C18.76 5 19.2 4.56 19.2 4.02V2.98C19.2 2.44 18.76 2 18.22 2Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12.22 19H9.78C9.24 19 8.8 19.44 8.8 19.98V21.02C8.8 21.56 9.24 22 9.78 22H12.22C12.76 22 13.2 21.56 13.2 21.02V19.98C13.2 19.44 12.76 19 12.22 19Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18.22 19H15.78C15.24 19 14.8 19.44 14.8 19.98V21.02C14.8 21.56 15.24 22 15.78 22H18.22C18.76 22 19.2 21.56 19.2 21.02V19.98C19.2 19.44 18.76 19 18.22 19Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 6V18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 12H18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const Palette = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="13.5" cy="6.5" r="2.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 2H17V22H7Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 2V22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 2V22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 2H17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 22H17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const Save = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H16L21 8V19C21 20.1 20.1 21 19 21Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 21V13H7V21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 3V8H15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const Plus = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M12 5V19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 12H19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const FileCode = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 2V8H20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 18L18 16L16 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 14L6 16L8 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);



// --- Render the App ---
ReactDOM.render(<App />, document.getElementById('root')); 
