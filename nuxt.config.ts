// fertilizer-api/nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: "2024-07-30",
  future: { compatibilityVersion: 4 },
  modules: ["@nuxthub/core", "@nuxt/eslint", "nuxt-resend"],

  devtools: { enabled: false },
  ssr: false,

  runtimeConfig: {
    resendApiKey: process.env.RESEND_API_KEY,
    public: {},
  },

  eslint: {
    config: {
      stylistic: {
        quotes: "single",
        commaDangle: "never",
      },
    },
  },

  hub: {
    database: true,  // NuxtHubのDB機能を有効化
    kv: true,
    blob: false,
    // ローカル開発環境では明示的にfalse
    remote: false,
  },

  nitro: {
    preset: "cloudflare-pages",
    experimental: {
      wasm: false,
    },
    externals: {
      inline: ["better-sqlite3"],
    },
    routeRules: {
      "/api/**": {
        cors: true,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      },
    },
  },

  vite: {
    optimizeDeps: {
      exclude: ["better-sqlite3"],
    },
    build: {
      rollupOptions: {
        external: ["better-sqlite3"],
      },
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  css: [],
  app: {
    head: {
      title: "Fertilizer API Server",
    },
  },
});
