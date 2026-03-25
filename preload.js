const { contextBridge, ipcRenderer } = require('electron')

// ============================================================
// 【注解1】contextBridge - 安全的 API 暴露机制
// contextBridge 用于在预加载脚本中安全地向渲染进程暴露 API
// 它避免了直接暴露 Node.js 或 Electron API，提高了安全性
// ============================================================

contextBridge.exposeInMainWorld('electronAPI', {
  // ============================================================
  // 【注解2】版本信息 - 暴露 Node.js、Chrome、Electron 版本
  // ============================================================
  versions: {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron
  },

  // ============================================================
  // 【注解3】应用信息 - 通过 IPC 获取主进程的应用信息
  // 使用 ipcRenderer.invoke 进行异步请求-响应通信
  // ============================================================
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),

  // ============================================================
  // 【注解4】文件操作 - 通过 IPC 与主进程通信
  // 渲染进程不能直接访问文件系统，需要通过主进程代理
  // ============================================================
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  saveFile: (filePath, content) => ipcRenderer.invoke('save-file', filePath, content),

  // ============================================================
  // 【注解5】对话框 - 原生系统对话框
  // ============================================================
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),

  // ============================================================
  // 【注解6】主题检测
  // ============================================================
  getTheme: () => ipcRenderer.invoke('get-theme'),

  // ============================================================
  // 【注解7】窗口控制
  // 通过 ipcRenderer.send 发送单向消息给主进程
  // ============================================================
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),

  // ============================================================
  // 【注解8】监听主进程发送的事件
  // 使用 ipcRenderer.on 监听来自主进程的消息
  // ============================================================
  onFileOpened: (callback) => {
    ipcRenderer.on('file-opened', (event, filePath) => callback(filePath))
  },
  onSaveFile: (callback) => {
    ipcRenderer.on('save-file', () => callback())
  },

  // ============================================================
  // 【注解9】移除事件监听器
  // 组件卸载时需要清理监听器，防止内存泄漏
  // ============================================================
  removeFileOpenedListener: () => {
    ipcRenderer.removeAllListeners('file-opened')
  },
  removeSaveFileListener: () => {
    ipcRenderer.removeAllListeners('save-file')
  }
})
