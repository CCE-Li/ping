<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div class="bg-white shadow-sm">
      <div class="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-gray-800">智能客服</h1>
          <p class="text-xs text-gray-500 mt-1">支持智能回复，必要时可转接人工</p>
        </div>
        <button
          type="button"
          class="text-sm text-white bg-primary px-3 py-2 rounded-lg disabled:opacity-50"
          :disabled="transferLoading"
          @click="transferToHuman"
        >
          {{ transferLoading ? '转接中...' : '转人工' }}
        </button>
      </div>
    </div>

    <div class="max-w-3xl mx-auto px-4 py-4">
      <div v-if="loadError" class="bg-white rounded-lg p-4 text-sm text-red-600">
        {{ loadError }}
      </div>

      <div
        ref="chatRef"
        class="mt-3 bg-white rounded-xl shadow-sm border border-gray-100 h-[65vh] overflow-y-auto p-4"
      >
        <div v-if="messages.length === 0" class="h-full flex items-center justify-center text-gray-500 text-sm">
          你好，我是智能客服。请描述你的问题。
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="(m, idx) in messages"
            :key="idx"
            class="flex"
            :class="m.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div class="max-w-[80%]">
              <div class="text-[11px] text-gray-400 mb-1" :class="m.role === 'user' ? 'text-right' : 'text-left'">
                {{ m.role === 'user' ? '我' : m.role === 'human' ? '人工客服' : '智能客服' }}
                <span v-if="m.time" class="ml-2">{{ m.time }}</span>
              </div>
              <div
                class="px-4 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words"
                :class="m.role === 'user' ? 'bg-primary text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'"
              >
                {{ m.content }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4 bg-white rounded-xl shadow-sm border border-gray-100 p-3">
        <div class="flex gap-2">
          <input
            v-model="input"
            class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="请输入问题..."
            @keydown.enter.prevent="send"
          />
          <button
            type="button"
            class="bg-primary text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50"
            :disabled="sending || !input.trim()"
            @click="send"
          >
            {{ sending ? '发送中...' : '发送' }}
          </button>
        </div>
        <div class="mt-2 flex items-center justify-between">
          <p class="text-xs text-gray-400">
            提示：输入“人工客服”可触发转人工建议
          </p>
          <p v-if="transferHint" class="text-xs text-amber-600">
            {{ transferHint }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue'

import { useUserStore } from '../stores/userStore'
import { aiApi } from '../utils/api'

const userStore = useUserStore()

const input = ref('')
const sending = ref(false)
const transferLoading = ref(false)
const loadError = ref('')
const transferHint = ref('')

const chatRef = ref(null)
const messages = ref([])

const getUserId = () => {
  return userStore.userInfo?.id || userStore.userInfo?.username || 'guest'
}

const scrollToBottom = async () => {
  await nextTick()
  const el = chatRef.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

const mergeChatRecords = (records) => {
  if (!Array.isArray(records)) return
  messages.value = records.map(r => ({
    role: r?.role || 'ai',
    content: r?.content || '',
    time: r?.time || ''
  }))
}

const send = async () => {
  const msg = input.value.trim()
  if (!msg || sending.value) return

  loadError.value = ''
  transferHint.value = ''

  messages.value.push({ role: 'user', content: msg, time: '' })
  input.value = ''
  await scrollToBottom()

  sending.value = true
  try {
    const payload = await aiApi.chat({ user_id: getUserId(), msg })
    const aiReply = payload?.ai_reply || ''

    if (payload?.chat_records) {
      mergeChatRecords(payload.chat_records)
    } else if (aiReply) {
      messages.value.push({ role: 'ai', content: aiReply, time: '' })
    }

    if (payload?.need_transfer) {
      transferHint.value = '系统建议：可点击右上角“转人工”获得人工帮助'
    }

    await scrollToBottom()
  } catch (e) {
    loadError.value = e?.message || '发送失败'
  } finally {
    sending.value = false
  }
}

const transferToHuman = async () => {
  if (transferLoading.value) return
  loadError.value = ''
  transferHint.value = ''

  transferLoading.value = true
  try {
    const payload = await aiApi.transfer({ user_id: getUserId() })
    const reply = payload?.reply || payload?.msg || '已为你转接人工客服，请稍候。'
    messages.value.push({ role: 'human', content: reply, time: '' })
    await scrollToBottom()
  } catch (e) {
    loadError.value = e?.message || '转人工失败'
  } finally {
    transferLoading.value = false
  }
}

onMounted(() => {
  messages.value = [
    { role: 'ai', content: '你好，我是智能客服。请问有什么可以帮你？', time: '' }
  ]
  scrollToBottom()
})
</script>
