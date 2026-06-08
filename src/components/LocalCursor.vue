<script>
import { useMultiplayerStore } from '@/stores/multiplayer'
import { onMounted, onUnmounted } from 'vue';

export default {
  setup() {
    const multiplayerStore = useMultiplayerStore()

    onMounted(() => {
      if (!multiplayerStore.initLocalCursorFromSession()) {
        const name = prompt('Enter your name:', 'Guest') || 'Guest'
        multiplayerStore.createLocalCursor(name)
      }
    })

    onUnmounted(() => {
      multiplayerStore.removeLocalCursor()
    })
  },
}
</script>
