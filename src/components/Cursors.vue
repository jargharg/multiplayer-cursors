<template>
  <ul role="presentation">
    <li v-for="cursor in multiplayerStore.cursors" :key="cursor.id">
      <Cursor v-bind="cursor" />
    </li>
  </ul>

  <LocalCursor />
</template>

<script setup>
import { useMultiplayerStore } from '@/stores/multiplayer';
import Cursor from './Cursor.vue'
import LocalCursor from './LocalCursor.vue'

const multiplayerStore = useMultiplayerStore()
</script>

<style lang="scss" scoped></style>