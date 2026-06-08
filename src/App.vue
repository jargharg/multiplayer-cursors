<template>
  <Cursors />
</template>

<script>
import Cursors from './components/Cursors.vue'
import { useMultiplayerStore } from './stores/multiplayer'

export default {
  components: {
    Cursors,
  },

  setup() {
    const multiplayerStore = useMultiplayerStore()

    const onMouseEnter = () => {
      multiplayerStore.setActiveStatus(true)
    }

    const onMouseLeave = () => {
      multiplayerStore.setActiveStatus(false)
    }

    const onMouseMove = (event) => {
      const x = event.pageX / document.documentElement.scrollWidth
      const y = event.pageY / document.documentElement.scrollHeight
      multiplayerStore.updateLocalCursorPosition(x, y)
    }

    const onWindowBlur = () => {
      multiplayerStore.setActiveStatus(false)
    }

    const onWindowFocus = () => {
      multiplayerStore.setActiveStatus(true)
    }

    const onClick = () => {
      multiplayerStore.triggerLocalCursorExplode()
    }

    window.addEventListener('blur', onWindowBlur)
    window.addEventListener('focus', onWindowFocus)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseenter', onMouseEnter)
    document.addEventListener('dblclick', onClick)
  },
}

</script>
