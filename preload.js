const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Window controls
    minimizeWindow: () => ipcRenderer.send('minimize-window'),
    maximizeWindow: () => ipcRenderer.send('maximize-window'),
    closeWindow: () => ipcRenderer.send('close-window'),
    
    // Connection and execution
    connectAndSend: (data) => ipcRenderer.invoke('connect-and-send', data),
    OpiumwareExecution: (data) => ipcRenderer.invoke('OpiumwareExecution', data),
    checkPortStatus: (port) => ipcRenderer.invoke('check-port-status', port),
    autoAttach: () => ipcRenderer.invoke('auto-attach'),
    
    // Script management
    saveScript: (data) => ipcRenderer.invoke('save-script', data),
    loadScript: (name) => ipcRenderer.invoke('load-script', name),
    getScripts: () => ipcRenderer.invoke('get-scripts'),
    deleteScript: (name) => ipcRenderer.invoke('delete-script', name),
    openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
    
    // Utility functions
    on: (channel, callback) => {
        // Whitelist channels
        const validChannels = ['script-executed', 'connection-status'];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => callback(...args));
        }
    },
    
    removeAllListeners: (channel) => {
        const validChannels = ['script-executed', 'connection-status'];
        if (validChannels.includes(channel)) {
            ipcRenderer.removeAllListeners(channel);
        }
    }
}); 