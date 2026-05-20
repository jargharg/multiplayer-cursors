<template>
  <div class="pointer-events-none">
    <div ref="elMainSelection" class="main-selection" />
    <div v-for="el in elsLineSelections" :key="el" class="line-selection"
      :style="{ top: el.top + 'px', left: el.left + 'px', width: el.width + 'px', height: el.height + 'px' }"></div>
  </div>
</template>

<script>
import gsap from 'gsap';
import { onMounted, onUnmounted, ref } from 'vue'

export default {
  setup() {
    const elMainSelection = ref(null)
    const elsLineSelections = ref([])

    function clearCurrentSelectionBoxes() {
      gsap.set(elMainSelection.value, { clearProps: true })
      elsLineSelections.value = []
    }

    function drawSelectionBoxes() {
      clearCurrentSelectionBoxes()
      var selection = window.getSelection()

      if (selection.type !== "Range") {
        return
      }

      const range = selection.getRangeAt(0)
      const mainRect = range.getBoundingClientRect()

      // Check to make sure the selection dimensions aren't zero.
      if (mainRect.width && mainRect.height) {
        const { top, left, width, height } = mainRect
        gsap.set(elMainSelection.value, { top, left, width, height })
      }

      const lineRects = Array.from(range.getClientRects())
      elsLineSelections.value = lineRects.map(rect => {
        if (rect.width && rect.height) {
          const { top, left, width, height } = rect
          return { top, left, width, height }
        }
      })
    }

    const onSelect = () => {
      drawSelectionBoxes()
    }

    const onSelectionChange = () => {
      drawSelectionBoxes()
    }

    onMounted(() => {
      document.addEventListener('select', onSelect)
      document.addEventListener('selectionchange', onSelectionChange)
    })

    onUnmounted(() => {
      document.removeEventListener('select', onSelect)
      document.removeEventListener('selectionchange', onSelectionChange)
    })

    return {
      elMainSelection,
      elsLineSelections,
    }
  }
}
</script>


<style>
.main-selection {
  position: absolute;
  /* background: linear-gradient(49deg, hsl(1, 100%, 75%), hsl(1, 100%, 90%), hsl(1, 100%, 84%)); */
  border: 1px solid hsl(13, 100%, 86%);
  mix-blend-mode: multiply;
}

.line-selection {
  position: absolute;
  background: hsl(13, 100%, 86%);
  mix-blend-mode: multiply;
  animation: pulse 2s ease-out infinite;
}

*::selection {
  outline: none;
  background: transparent;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.25;
  }
  100% {
    opacity: 1;
  }
}
</style>
