<template>
  <div class="log-viewer">
    <el-page-header content="系统运行日志" class="page-header" @back="goBack" />

    <el-card class="log-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">最近运行日志</span>
          <div class="card-actions">
            <el-tag v-if="logFilePath" size="small" type="info" effect="plain" class="log-path">
              日志文件：{{ logFilePath }}
            </el-tag>
            <el-button type="primary" :loading="isLoading" :disabled="!supportsLogs" link @click="refreshLogs">
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <el-alert
        v-if="!supportsLogs"
        title="当前环境暂不支持日志查看"
        type="warning"
        :closable="false"
        description="请在 Electron 客户端中打开应用以查看本地运行日志。"
        class="environment-alert"
      />

      <el-alert
        v-else-if="errorMessage"
        title="日志加载失败"
        type="error"
        :closable="false"
        :description="errorMessage"
        class="environment-alert"
      />

      <el-skeleton v-else :loading="isLoading" animated>
        <template #template>
          <el-skeleton-item variant="h3" style="width: 40%" />
          <el-skeleton-item variant="text" v-for="i in 6" :key="i" />
        </template>

        <template #default>
          <el-empty v-if="!logs.length" description="暂无日志数据" />

          <el-scrollbar v-else class="log-scroll">
            <pre class="log-content">
              <code v-for="(line, index) in logs" :key="index">{{ line }}</code>
            </pre>
          </el-scrollbar>
        </template>
      </el-skeleton>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const logs = ref<string[]>([])
const logFilePath = ref<string | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')

const supportsLogs = Boolean(window.electronAPI?.getLogs)

const goBack = () => {
  router.push({ name: 'report' })
}

const fetchLogs = async () => {
  if (!supportsLogs) {
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const result = await window.electronAPI!.getLogs!()
    logs.value = result.logs || []
    logFilePath.value = result.logFilePath ?? null
  } catch (error) {
    if (error instanceof Error) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = String(error)
    }
  } finally {
    isLoading.value = false
  }
}

const refreshLogs = () => {
  void fetchLogs()
}

onMounted(() => {
  void fetchLogs()
})
</script>

<style scoped>
.log-viewer {
  padding: 16px 24px 32px;
  min-height: calc(100vh - 160px);
}

.page-header {
  margin-bottom: 16px;
}

.log-card {
  border-radius: 16px;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.log-path {
  max-width: 420px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.environment-alert {
  margin-bottom: 16px;
}

.log-scroll {
  max-height: 480px;
  border-radius: 12px;
  background: #0f172a;
  color: #e2e8f0;
  padding: 16px;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.2);
}

.log-content {
  font-family: 'Fira Code', 'Consolas', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
}

.log-content code {
  display: block;
  color: inherit;
}

@media (max-width: 768px) {
  .log-viewer {
    padding: 12px 16px 24px;
  }

  .log-scroll {
    max-height: 360px;
    padding: 12px;
  }
}
</style>
