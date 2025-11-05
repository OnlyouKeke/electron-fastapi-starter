/// <reference types="vite/client" />

// 声明Vue文件模块
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 声明图片等资源模块
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'
declare module '*.svg' {
  import React from 'react'
  const SVG: React.VFC<React.SVGProps<SVGSVGElement>>
  export default SVG
}

export {}

declare global {
  interface ElectronBridgeAPI {
    getAppInfo: () => Promise<{
      version: string
      name: string
      appPath: string
    }>
    getLogs?: () => Promise<{
      logs: string[]
      logFilePath: string | null
    }>
    send: (channel: string, data: any) => void
    receive: (channel: string, func: (...args: any[]) => void) => void
  }

  interface AppRuntimeInfo {
    isElectron?: boolean
    platform?: string
  }

  interface Window {
    electronAPI?: ElectronBridgeAPI
    appRuntime?: AppRuntimeInfo
  }
}
