// ============================================================
// 渲染进程入口文件
// 负责处理界面交互和与主进程通信
// ============================================================

// ============================================================
// 【注解1】通过预加载脚本暴露的 API 与主进程通信
// window.electronAPI 是由 preload.js 通过 contextBridge 暴露的
// 这种方式保证了渲染进程无法直接访问 Node.js API，保证安全性
// ============================================================

// ============================================================
// 【注解2】DOM 元素引用
// 获取页面中的各种交互元素
// ============================================================
const appInfoBtn = document.getElementById('btn-app-info')
const appInfoDisplay = document.getElementById('app-info-display')
const messageBoxBtn = document.getElementById('btn-message-box')
const openFileBtn = document.getElementById('btn-open-file')
const saveFileBtn = document.getElementById('btn-save-file')
const minimizeBtn = document.getElementById('btn-minimize')
const maximizeBtn = document.getElementById('btn-maximize')
const closeBtn = document.getElementById('btn-close')
const fileContent = document.getElementById('file-content')
const currentFileDisplay = document.getElementById('current-file')
const processInfoDisplay = document.getElementById('process-info')
const rendererVersion = document.getElementById('renderer-version')
const mainProcessPid = document.getElementById('main-process-pid')

let currentFilePath = null

// ============================================================
// 【注解3】初始化函数
// 页面加载完成后执行初始化操作
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  await initProcessInfo()
  initEventListeners()
  initIPCListeners()
})

// ============================================================
// 【注解4】初始化进程信息展示
// 通过 IPC 获取主进程信息
// ============================================================
async function initProcessInfo() {
  try {
    const appInfo = await window.electronAPI.getAppInfo()
    
    processInfoDisplay.innerHTML = `
      <span class="label">应用名称:</span> <span class="value">${appInfo.name}</span><br>
      <span class="label">应用版本:</span> <span class="value">${appInfo.version}</span><br>
      <span class="label">Electron:</span> <span class="value">${appInfo.electronVersion}</span><br>
      <span class="label">Chrome:</span> <span class="value">${appInfo.chromeVersion}</span><br>
      <span class="label">Node.js:</span> <span class="value">${appInfo.nodeVersion}</span><br>
      <span class="label">平台:</span> <span class="value">${appInfo.platform} (${appInfo.arch})</span>
    `
    
    rendererVersion.textContent = `v${window.electronAPI.versions.electron()}`
  } catch (error) {
    console.error('获取应用信息失败:', error)
  }
}

// ============================================================
// 【注解5】初始化事件监听器
// 为各种交互元素绑定事件处理函数
// ============================================================
function initEventListeners() {
  // 应用信息按钮
  appInfoBtn.addEventListener('click', async () => {
    const appInfo = await window.electronAPI.getAppInfo()
    appInfoDisplay.innerHTML = `
      <span class="label">Electron:</span> <span class="value">v${appInfo.electronVersion}</span><br>
      <span class="label">Chrome:</span> <span class="value">v${appInfo.chromeVersion}</span><br>
      <span class="label">Node.js:</span> <span class="value">v${appInfo.nodeVersion}</span><br>
      <span class="label">平台:</span> <span class="value">${appInfo.platform}</span>
    `
    appInfoDisplay.classList.remove('hidden')
  })

  // 消息框按钮
  messageBoxBtn.addEventListener('click', async () => {
    await window.electronAPI.showMessageBox({
      type: 'info',
      title: '消息框演示',
      message: '这是一个 Electron 原生消息框！',
      detail: '你可以使用 dialog 模块创建各种原生对话框。\n包括：消息框、文件选择框、保存对话框等。',
      buttons: ['确定', '取消']
    })
  })

  // 打开文件按钮
  openFileBtn.addEventListener('click', async () => {
    const result = await window.electronAPI.showOpenDialog({
      title: '选择文件',
      properties: ['openFile'],
      filters: [
        { name: '文本文件', extensions: ['txt', 'js', 'json', 'md'] },
        { name: '所有文件', extensions: ['*'] }
      ]
    })

    if (!result.canceled && result.filePaths.length > 0) {
      currentFilePath = result.filePaths[0]
      currentFileDisplay.textContent = currentFilePath
      
      const fileResult = await window.electronAPI.readFile(currentFilePath)
      if (fileResult.success) {
        fileContent.value = fileResult.content
      } else {
        await window.electronAPI.showMessageBox({
          type: 'error',
          title: '读取失败',
          message: `无法读取文件: ${fileResult.error}`
        })
      }
    }
  })

  // 保存文件按钮
  saveFileBtn.addEventListener('click', async () => {
    if (!currentFilePath) {
      const result = await window.electronAPI.showSaveDialog({
        title: '保存文件',
        defaultPath: 'untitled.txt',
        filters: [
          { name: '文本文件', extensions: ['txt'] },
          { name: '所有文件', extensions: ['*'] }
        ]
      })

      if (result.canceled) return
      currentFilePath = result.filePath
      currentFileDisplay.textContent = currentFilePath
    }

    const content = fileContent.value
    const saveResult = await window.electronAPI.saveFile(currentFilePath, content)
    
    if (saveResult.success) {
      await window.electronAPI.showMessageBox({
        type: 'info',
        title: '保存成功',
        message: '文件保存成功！'
      })
    } else {
      await window.electronAPI.showMessageBox({
        type: 'error',
        title: '保存失败',
        message: `无法保存文件: ${saveResult.error}`
      })
    }
  })

  // 窗口控制按钮
  minimizeBtn.addEventListener('click', () => {
    window.electronAPI.minimizeWindow()
  })

  maximizeBtn.addEventListener('click', () => {
    window.electronAPI.maximizeWindow()
  })

  closeBtn.addEventListener('click', () => {
    window.electronAPI.closeWindow()
  })

  // 文件内容变化时清除当前文件路径（下次保存时需要重新选择）
  fileContent.addEventListener('input', () => {
    // 标记内容已修改
  })
}

// ============================================================
// 【注解6】初始化 IPC 事件监听
// 监听来自主进程的消息和事件
// ============================================================
function initIPCListeners() {
  // 监听菜单"打开文件"事件
  window.electronAPI.onFileOpened(async (filePath) => {
    currentFilePath = filePath
    currentFileDisplay.textContent = filePath
    
    const fileResult = await window.electronAPI.readFile(filePath)
    if (fileResult.success) {
      fileContent.value = fileResult.content
    }
  })

  // 监听菜单"保存文件"事件
  window.electronAPI.onSaveFile(async () => {
    if (currentFilePath) {
      const content = fileContent.value
      await window.electronAPI.saveFile(currentFilePath, content)
    } else {
      saveFileBtn.click()
    }
  })
}
