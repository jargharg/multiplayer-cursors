<template>
  <div ref="elChatBox" :class="['chat-bubble', chatMessage || isActive ? 'active' : '']"
    :style="{ backgroundColor: color, ...style }" role="presentation" aria-hidden="true">
    <svg viewBox="0 0 10 10" :fill="color">
      <path d="M0,0 L 10 3 V10 H3Z" />
    </svg>

    {{ chatMessage }}
  </div>
</template>

<script>
export default {
  props: {
    chatMessage: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: 'red'
    },
    style: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>

<style scoped>
.chat-bubble {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  pointer-events: none;
  color: white;
  font-size: 12px;
  font-family: monospace;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  border-radius: 999px;
  z-index: 999999999;
  visibility: hidden;
  white-space: nowrap;

  &.active {
    visibility: visible;
  }

  svg {
    z-index: -1;
    position: absolute;
    top: 0;
    left: 0;
    width: 12px;
    height: 12px;
  }
}
</style>