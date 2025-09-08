/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ViteTypeOptions {
    strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  readonly VITE_HOST: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}