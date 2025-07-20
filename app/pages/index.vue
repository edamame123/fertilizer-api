<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
const colors = ['#f87171', '#fb923c', '#fbbf24', '#facc15', '#a3e635', '#4ade80', '#34d399', '#2dd4bf', '#22d3ee', '#38bdf8', '#60a5fa', '#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6', '#fb7185']
const color = useState('color', () => colors[Math.floor(Math.random() * colors.length)])
</script>

<template>
  <div class="centered">
    <h1 :style="{ color }">
      Fertilizer API Server
    </h1>
    <p class="description">
      REST API経由で肥料データを提供するAPIサーバーです
    </p>
    <div class="links">
      <NuxtLink to="/docs" class="btn btn-primary">
        📚 API ドキュメント
      </NuxtLink>
      <NuxtLink to="/api/ping" class="btn btn-secondary" external>
        🏥 ヘルスチェック
      </NuxtLink>
      <NuxtLink to="/" external class="btn btn-ghost">
        🔄 リフレッシュ
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.centered {
  position: absolute;
  width: 100%;
  text-align: center;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

h1 {
  font-size: 32px;
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  h1 {
    font-size: 64px;
  }
}

.description {
  font-size: 18px;
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.links {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f8f9fa;
  color: #495057;
  border-color: #dee2e6;
}

.btn-secondary:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

.btn-ghost {
  color: #888;
  font-size: 16px;
}

.btn-ghost:hover {
  text-decoration: underline;
  color: #555;
}
</style>
