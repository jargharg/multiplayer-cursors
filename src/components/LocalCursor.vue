<template>
  <input name="chatMessage" type="text" v-model="chatMessage" ref="elChatInput" class="local-chat-input" />

  <div ref="elChatBox" class="chat-box">
    <span class="sub-name" ref="elSubName" aria-hidden="true">{{ multiplayerStore.localCursor?.name }}</span>

    <ChatBubble :chatMessage="chatMessage" :isActive="forceChatBoxOpen" :color="multiplayerStore.localCursor?.color" />
  </div>
</template>

<script>
import { useMultiplayerStore } from '@/stores/multiplayer'
import { ref, watch, onMounted, onUnmounted } from 'vue';
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
    const elSubName = ref(null)
    const forceChatBoxOpen = ref(false)
    let clearChatBoxTimeout

    const clearChatBox = () => {
      chatMessage.value = ''
      forceChatBoxOpen.value = false
    }

    const toggleSubstituteCursor = (isActive) => {
      elSubName.value.classList.toggle('active', isActive)

      if (isActive) {
        document.body.style.cursor = 'hidden';
      } else {
        document.body.style.cursor = multiplayerStore.localCursor?.name ? `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' style='font-size: 2rem;'><text x='50%' y='60%' dominant-baseline='middle' text-anchor='middle'>${multiplayerStore.localCursor.name}</text></svg>") 18 18, auto` : 'auto';
      }
    }

    const onKeyDown = (event) => {
      if (event.key === '/') {
        event.preventDefault()
        elChatInput.value.focus()
        forceChatBoxOpen.value = true
        clearTimeout(clearChatBoxTimeout)
      }

      if ((event.key === 'Escape' || event.key === 'Enter') && document.activeElement === elChatInput.value) {
        elChatInput.value.blur()
        chatMessage.value = ''
        forceChatBoxOpen.value = false
        clearTimeout(clearChatBoxTimeout)
      }
    }

    onMounted(async () => {
      await multiplayerStore.initLocalCursorFromSession()

      toggleSubstituteCursor(false)

      const xSetter = gsap.quickSetter(elChatBox.value, 'x', 'px')
      const ySetter = gsap.quickSetter(elChatBox.value, 'y', 'px')

      document.addEventListener('mousemove', (event) => {
        xSetter(event.pageX)
        ySetter(event.pageY)
      })

      document.addEventListener('keydown', onKeyDown)

      elChatInput.value.addEventListener('focus', () => {
        toggleSubstituteCursor(true)
        document.addEventListener('mousemove', () => toggleSubstituteCursor(false), { once: true })
      })
    })

    onUnmounted(() => {
      multiplayerStore.removeLocalCursor()
      document.body.style.cursor = 'auto';
      document.removeEventListener('keydown', onKeyDown)
    })


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
        }, 5000)
      }
    })

    return {
      elChatBox,
      elChatInput,
      elSubName,
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
  cursor: inherit;
}

.chat-box {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 999999999;
}

.sub-name {
  display: none;
  font-size: 2rem;
  margin: 0;
  transform: translate(-50%, -50%);

  &.active {
    display: block;
  }
}
</style>