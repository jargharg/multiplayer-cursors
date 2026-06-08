<template>
  <div role="presentation">
    <Cursor v-bind="cursor" v-for="cursor in multiplayerStore.cursors" :key="cursor.id" />
  </div>

  <LocalCursor />
</template>

<script setup>
import { useMultiplayerStore } from '@/stores/multiplayer';
import Cursor from './Cursor.vue'
import LocalCursor from './LocalCursor.vue'

const multiplayerStore = useMultiplayerStore()
</script>

<style lang="scss" scoped></style>