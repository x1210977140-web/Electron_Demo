const { app, BrowserWindow, ipcMain, dialog, Menu, Tray, globalShortcut, shell, nativeTheme } = require('electron')
const path = require('path')
const fs = require('fs')

let mainWindow = null
let tray = null

// ============================================================
// 【注解1】应用入口 - app 模块
// app 模块控制应用程序的事件生命周期
// whenReady() 在 Electron 完成初始化后触发
// ============================================================
app.whenReady().then(() => {
  createWindow()
  createMenu()
  createTray()
  registerGlobalShortcut()
})

// ============================================================
// 【注解2】窗口创建 - BrowserWindow 模块
// 创建和控制浏览器窗口
// ============================================================
function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Electron 核心功能演示',
    backgroundColor: '#1a1a2e',
    webPreferences: {
      // ============================================================
      // 【注解3】预加载脚本 - preload.js
      // 在页面加载之前执行，用于安全地暴露 API 给渲染进程
      // 这里使用 contextBridge 实现安全的 IPC 通信
      // ============================================================
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,      // 禁用 Node.js 在渲染进程中使用
      contextIsolation: true,     // 启用上下文隔离，安全最佳实践
      sandbox: true               // 启用沙箱模式
    }
  })

  // 加载 index.html
  mainWindow.loadFile('index.html')

  // ============================================================(
  // 【注解4】窗口事件监听
  // 监听窗口的打开、关闭、最小化等事件
  // ============================================================
  mainWindow.on('minimized', () => {
    console.log('窗口最小化')
  })

  mainWindow.on('closed', () => {
    console.log('窗口关闭')
    mainWindow = null
  })

  // 打开开发者工具（在渲染进程中可使用 F12）
  mainWindow.webContents.openDevTools()
}

// ============================================================
// 【注解5】菜单系统 - Menu 模块
// 创建原生应用菜单
// ============================================================
function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '打开文件',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [
                { name: '文本文件', extensions: ['txt', 'js', 'json'] },
                { name: '所有文件', extensions: ['*'] }
              ]
            })
            if (!result.canceled && result.filePaths.length > 0) {
              mainWindow.webContents.send('file-opened', result.filePaths[0])
            }
          }
        },
        {
          label: '保存文件',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('save-file')
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
        { role: 'selectAll', label: '全选' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload', label: '重新加载' },
        { role: 'forceReload', label: '强制重新加载' },
        { role: 'toggleDevTools', label: '开发者工具' },
        { type: 'separator' },
        { role: 'resetZoom', label: '实际大小' },
        { role: 'zoomIn', label: '放大' },
        { role: 'zoomOut', label: '缩小' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '全屏' }
      ]
    },
    {
      label: '窗口',
      submenu: [
        { role: 'minimize', label: '最小化' },
        { role: 'zoom', label: '缩放' },
        { type: 'separator' },
        { role: 'close', label: '关闭' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于',
              message: 'Electron 核心功能演示',
              detail: `Electron 版本: ${process.versions.electron}\nChrome 版本: ${process.versions.chrome}\nNode.js 版本: ${process.versions.node}`
            })
          }
        },
        {
          label: '打开外部链接',
          click: () => {
            shell.openExternal('https://www.electronjs.org')
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// ============================================================
// 【注解6】系统托盘 - Tray 模块
// 创建系统托盘图标和菜单
// ============================================================
function createTray() {
  // 注意: 实际项目中需要准备一个图标文件
  // 这里为了演示，创建简单的托盘逻辑
  // const iconPath = path.join(__dirname, 'icon.png')
  // tray = new Tray(iconPath)
  
  // 托盘菜单模板
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示窗口',
      click: () => {
        if (mainWindow) {
          mainWindow.show()
          mainWindow.focus()
        }
      }
    },
    {
      label: '隐藏窗口',
      click: () => {
        if (mainWindow) {
          mainWindow.hide()
        }
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit()
      }
    }
  ])

  // 如果有图标文件，可以取消注释以下代码
  // tray.setToolTip('Electron 演示')
  // tray.setContextMenu(contextMenu)
  // tray.on('click', () => {
  //   mainWindow.show()
  // })
}

// ============================================================
// 【注解7】全局快捷键 - globalShortcut 模块
// 注册全局可用的键盘快捷键
// ============================================================
function registerGlobalShortcut() {
  // 注册 CmdOrCtrl+Shift+D 快捷键，显示/隐藏窗口
  const ret = globalShortcut.register('CommandOrControl+Shift+D', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow.show()
        mainWindow.focus()
      }
    }
  })

  if (!ret) {
    console.log('全局快捷键注册失败')
  }
}

// ============================================================
// 【注解8】IPC 通信 - ipcMain 模块
// 主进程与渲染进程之间的双向通信
// ============================================================

// 监听渲染进程发送的消息
ipcMain.handle('get-app-info', () => {
  return {
    name: app.getName(),
    version: app.getVersion(),
    electronVersion: process.versions.electron,
    chromeVersion: process.versions.chrome,
    nodeVersion: process.versions.node,
    platform: process.platform,
    arch: process.arch
  }
})

// 监听文件读取请求
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return { success: true, content }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// 监听文件保存请求
ipcMain.handle('save-file', async (event, filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// 监听对话框请求
ipcMain.handle('show-message-box', async (event, options) => {
  return await dialog.showMessageBox(mainWindow, options)
})

// 监听选择文件对话框
ipcMain.handle('show-open-dialog', async (event, options) => {
  return await dialog.showOpenDialog(mainWindow, options)
})

// 监听选择保存路径对话框
ipcMain.handle('show-save-dialog', async (event, options) => {
  return await dialog.showSaveDialog(mainWindow, options)
})

// 监听主题切换
ipcMain.handle('get-theme', () => {
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
})

// 监听窗口控制
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize()
})

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  }
})

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close()
})

// ============================================================
// 【注解9】应用事件监听
// 监听 macOS 上的特定行为
// ============================================================
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd+Q 显式退出
  // 否则应用和菜单栏会保持活跃
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // macOS 上，当点击 Dock 图标时
  // 如果没有窗口，会重新创建窗口
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// ============================================================
// 【注解10】应用退出前清理
// 注销所有已注册的全局快捷键
// ============================================================
app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
