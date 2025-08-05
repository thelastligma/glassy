# Opiumware Executor

A modern, seamless Roblox executor with a beautiful UI designed for macOS and Electron. This executor provides a professional interface for executing Lua scripts with advanced features like script management, tabbed editing, and real-time connection status.

## Features

### 🎨 Modern UI
- **Custom Title Bar**: Seamless macOS-style window controls
- **Dark Theme**: Professional dark interface with blue accents
- **Custom Icons**: Beautiful FontAwesome icons throughout the interface
- **Responsive Design**: Adapts to different screen sizes

### 🔧 Core Functionality
- **Multi-Port Support**: Connect to ports 8392-8397
- **Auto-Attach**: Automatically find and connect to available ports
- **Script Execution**: Execute Lua scripts with compression
- **Real-time Status**: Live connection status indicators

### 📝 Script Management
- **Tabbed Editor**: Multiple script tabs for organization
- **Save/Load Scripts**: Persistent script storage
- **File Import**: Open external .lua files
- **Script Library**: Built-in script management system

### ⚡ Advanced Features
- **Keyboard Shortcuts**: Quick access to common actions
- **Auto-Save**: Automatic script saving (optional)
- **Console Output**: Real-time execution feedback
- **Settings Panel**: Customizable preferences

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Development Setup
1. Clone the repository:
```bash
git clone <repository-url>
cd opiumware-executor
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

### Building for Distribution

#### macOS
```bash
npm run build:mac
```

#### Windows
```bash
npm run build:win
```

#### Linux
```bash
npm run build:linux
```

## Usage

### Getting Started
1. Launch the application
2. Click "Auto Attach" to automatically connect to an available port
3. Write or load your Lua script in the editor
4. Click "Execute" to run the script

### Keyboard Shortcuts
- `Ctrl+S`: Save script
- `Ctrl+Enter`: Execute script
- `Ctrl+N`: New script
- `Ctrl+O`: Open file
- `Ctrl+Shift+N`: New tab

### Script Management
- **Save Scripts**: Use the Save button or Ctrl+S to save scripts
- **Load Scripts**: Use the Load button to open saved scripts
- **Import Files**: Use the Open button to import external .lua files
- **Delete Scripts**: Right-click on scripts in the sidebar to delete

### Connection Management
- **Auto Attach**: Automatically finds and connects to available ports
- **Manual Port Selection**: Choose specific ports from the dropdown
- **Status Indicator**: Real-time connection status with visual feedback

## File Structure

```
opiumware-executor/
├── main.js              # Main Electron process
├── preload.js           # Preload script for security
├── index.html           # Main UI template
├── styles.css           # UI styling
├── renderer.js          # Frontend logic
├── package.json         # Project configuration
├── README.md           # This file
├── assets/             # Icons and assets
│   ├── icon.png        # App icon
│   ├── icon.icns       # macOS icon
│   └── icon.ico        # Windows icon
└── scripts/            # Saved scripts directory
```

## API Integration

The executor connects to Opiumware on localhost ports 8392-8397. It uses:
- **TCP Socket Communication**: Direct socket connections
- **Zlib Compression**: Script compression for efficiency
- **Timeout Handling**: Robust connection management
- **Error Recovery**: Graceful error handling

## Development

### Project Structure
- **main.js**: Electron main process with IPC handlers
- **preload.js**: Secure API exposure to renderer
- **renderer.js**: Frontend logic and UI interactions
- **styles.css**: Modern CSS with dark theme

### Key Features Implemented
- ✅ Custom title bar with window controls
- ✅ Modern dark UI with blue accents
- ✅ Tabbed script editor
- ✅ Script save/load functionality
- ✅ Auto-attach connection
- ✅ Real-time status indicators
- ✅ Console output system
- ✅ Keyboard shortcuts
- ✅ File import/export
- ✅ Settings panel

### Security Features
- **Context Isolation**: Secure IPC communication
- **Node Integration Disabled**: Enhanced security
- **Remote Module Disabled**: Prevents unauthorized access
- **Input Validation**: Safe script handling

## Building Custom Icons

To create custom icons for the application:

1. **macOS (.icns)**:
   - Create 16x16, 32x32, 128x128, 256x256, 512x512, and 1024x1024 PNG files
   - Use Icon Composer or online tools to create .icns file

2. **Windows (.ico)**:
   - Create multiple sizes (16x16, 32x32, 48x48, 256x256)
   - Use online converters or icon editors

3. **Linux (.png)**:
   - Create a 512x512 PNG file

## Troubleshooting

### Common Issues

**Connection Failed**
- Ensure Opiumware is running
- Check if ports 8392-8397 are available
- Try different ports in the dropdown

**Script Not Executing**
- Verify connection status is "Connected"
- Check console output for error messages
- Ensure script syntax is valid Lua

**App Won't Start**
- Verify Node.js version (16+)
- Run `npm install` to install dependencies
- Check console for error messages

### Debug Mode
Run with debug logging:
```bash
npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the console output for error messages

---

**Note**: This executor is designed for educational and development purposes. Always follow Roblox's Terms of Service when using scripts. 