<template>
  <input name="chatMessage" type="text" v-model="chatMessage" ref="elChatInput" class="local-chat-input" />

  <ChatBubble ref="elChatBox" :chatMessage="chatMessage" :isActive="forceChatBoxOpen"
    :color="multiplayerStore.localCursor?.color" />
</template>

<script>
import { useMultiplayerStore } from '@/stores/multiplayer'
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import gsap from 'gsap'
import ChatBubble from './ChatBubble.vue';

export default {
  components: {
    ChatBubble,
  },

  setup() {
    const multiplayerStore = useMultiplayerStore()
    const chatMessage = ref(multiplayerStore.localCursor?.chatMessage)
    const elChatBox = ref(null)
    const elChatInput = ref(null)
    const forceChatBoxOpen = ref(false)
    let clearChatBoxTimeout
    
    const clearChatBox = () => {
      chatMessage.value = ''
      forceChatBoxOpen.value = false
    }

    watch(() => chatMessage.value, (newMessage) => {
      multiplayerStore.setChatMessage(newMessage)

      clearTimeout(clearChatBoxTimeout)
      clearChatBoxTimeout = setTimeout(() => {
        clearChatBox()
      }, 5000)
    })

    watch(forceChatBoxOpen, (isOpen) => {
      if (isOpen) {
        clearTimeout(clearChatBoxTimeout)
      } else {
        clearChatBoxTimeout = setTimeout(() => {
          clearChatBox()
        }, 1000)
      }
    })

    const onKeyDown = (event) => {
      if (event.key === '/') {
        event.preventDefault()
        elChatInput.value.focus()
        forceChatBoxOpen.value = true
      }

      if ((event.key === 'Escape' || event.key === 'Enter') && document.activeElement === elChatInput.value) {
        elChatInput.value.blur()
        chatMessage.value = ''
        forceChatBoxOpen.value = false
      }
    }

    onMounted(async () => {
      await multiplayerStore.initLocalCursorFromSession()

      const xSetter = gsap.quickSetter(elChatBox.value.$el, 'x', 'px')
      const ySetter = gsap.quickSetter(elChatBox.value.$el, 'y', 'px')

      document.addEventListener('mousemove', (event) => {
        xSetter(event.pageX)
        ySetter(event.pageY)
      })

      document.addEventListener('keydown', onKeyDown)
    })

    onUnmounted(() => {
      multiplayerStore.removeLocalCursor()
      document.removeEventListener('keydown', onKeyDown)
    })

    return {
      elChatBox,
      elChatInput,
      chatMessage,
      forceChatBoxOpen,
      multiplayerStore,
    }
  },
}
</script>

<style scoped>
.local-chat-input {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  height: 0;
  width: 0;
  pointer-events: all;
  cursor: default;
}
</style>