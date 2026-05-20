<template>
  <main @mousemove="onMouseMove" @mouseleave="onMouseLeave" @mouseenter="onMouseEnter" @dblclick="onClick">
    <DemoContent />
  </main>

  <Cursors />
  <!-- <SelectionOutlines /> -->
</template>

<script>
import Cursors from './components/Cursors.vue'
import DemoContent from './components/DemoContent.vue'
// import SelectionOutlines from './components/SelectionOutlines.vue'
import { useMultiplayerStore } from './stores/multiplayer'

export default {
  components: {
    Cursors,
    DemoContent,
    // SelectionOutlines
  },
  setup() {
    const multiplayerStore = useMultiplayerStore()

    const onMouseEnter = () => {
      multiplayerStore.setActiveStatus(true)
    }

    const onMouseLeave = () => {
      multiplayerStore.setActiveStatus(false)
    }
    
    const onWindowBlur = () => {
      multiplayerStore.setActiveStatus(false)
    }
    
    const onWindowFocus = () => {
      multiplayerStore.setActiveStatus(true)
    }
    
    window.addEventListener('blur', onWindowBlur)
    window.addEventListener('focus', onWindowFocus)

    const onMouseMove = (event) => {
      const x = event.pageX / document.documentElement.scrollWidth
      const y = event.pageY / document.documentElement.scrollHeight
      multiplayerStore.updateLocalCursorPosition(x, y)
    }

    const onClick = () => {
      multiplayerStore.triggerLocalCursorExplode()
    }

    return {
      multiplayerStore,
      onClick,
      onMouseEnter,
      onMouseLeave,
      onMouseMove,
    }
  },
}

</script>
