<template>
  <div>
    <Head>
      <title>Fertilizer API Documentation</title>
      <meta name="description" content="Fertilizer API の詳細なドキュメント" />
    </Head>
    
    <div class="docs-header">
      <h1>Fertilizer API Documentation</h1>
      <p>REST API経由で肥料データを提供するAPIサーバーのドキュメントです。</p>
    </div>
    
    <div id="swagger-ui" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

// ページのメタ情報
definePageMeta({
  title: 'API Documentation',
  description: 'Fertilizer API の詳細なドキュメント'
})

onMounted(async () => {
  // Swagger UIを動的にロード
  const SwaggerUIBundle = (await import('swagger-ui-dist/swagger-ui-bundle.js')).default

  // Swagger UIを初期化
  SwaggerUIBundle({
    url: '/api/openapi.yaml',
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIBundle.presets.standalone
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    // カスタマイズ設定
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 1,
    displayOperationId: false,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
    // サーバー設定
    servers: [
      {
        url: window.location.origin,
        description: '現在のサーバー'
      }
    ]
  })
})
</script>

<style scoped>
.docs-header {
  padding: 2rem 1rem;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-bottom: 0;
}

.docs-header h1 {
  margin: 0 0 1rem 0;
  font-size: 2.5rem;
  font-weight: 600;
}

.docs-header p {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

:deep(#swagger-ui) {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* Swagger UIのカスタムスタイル */
:deep(.swagger-ui .topbar) {
  display: none;
}

:deep(.swagger-ui .info) {
  margin: 20px 0;
}

:deep(.swagger-ui .scheme-container) {
  background: #fafafa;
  padding: 15px;
  border-radius: 4px;
  margin: 20px 0;
}
</style>

<style>
/* Swagger UI CSSをインポート */
@import 'swagger-ui-dist/swagger-ui.css';
</style>