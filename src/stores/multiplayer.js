import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { initializeApp } from 'firebase/app'
import { getDatabase, set, ref as fbRef, onValue } from 'firebase/database'
import gsap from 'gsap'

const EMOJIS = ['😀', '😁', '😂', '😄', '😆', '😇', '😈', '😉', '😋', '😌', '😍', '😎', '😏', '😑', '😒', '😔', '😖', '😘', '😛', '😜', '😟', '😠', '😡', '😢', '😣', '😤', '😥', '😫', '😬', '😭', '😮', '😯', '😰', '😱', '😲', '😳', '😴', '😵', '😶', '🙂', '🙃', '🙄', '🤑', '🤓', '🤔', '🤗', '🤠', '🤤', '🤨', '🤩', '🤪', '🤫', '🤭', '🤮', '🤯', '🥰', '🥱', '🥳', '🥴', '🥺', '🧐', '😸', '😹', '😺', '😻', '😼', '💀', '✌', '🤘', '🤞', '👮', '👷', '🕵', '💃', '👶', '🎅', '👻', '👼', '👽', '🤖', '🤡', '🧚', '👀', '🐓', '🐙', '🐨', '🐴', '🐷', '🐸', '🐹', '🐼', '🕷', '🦀', '🦁', '🌞', '🌚', '😶‍🌫️']

const initializeFirebase = () => {
  return initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  })
}

const createCursor = (id, userData) => {
  return {
    id,
    name: userData.name,
    color: userData.color,
    cursorCount: userData.cursorCount,
    explode: userData.explode ?? false,
    x: userData.x,
    y: userData.y,
    lastActive: userData.lastActive,
    isActive: userData.isActive ?? false,
    chatMessage: userData.chatMessage ?? null,
  }
}

export const useMultiplayerStore = defineStore('multiplayer', () => {
  const app = ref(initializeFirebase())
  const cursors = ref([])
  const db = getDatabase(app.value)
  const localCursor = ref(null)
  const localUserId = ref(null)
  const isInitialized = ref(false)
  const usersRef = fbRef(db, 'users/')

  const updateLocalCursorInDb = () => {
    localCursor.value.lastActive = Date.now()
    set(fbRef(db, `users/${localUserId.value}`), localCursor.value)
  }

  onValue(usersRef, (snapshot) => {
    const users = snapshot.val()
    const now = Date.now()

    for (const userId in users) {
      const userData = users[userId]

      if (userId === localUserId.value || (userData.lastActive && now - userData.lastActive > 60000)) {
        continue
      }

      const existingCursorIndex = cursors.value.findIndex(cursor => cursor.id === userId)

      if (existingCursorIndex > -1) {
        cursors.value[existingCursorIndex] = createCursor(userId, userData)
      } else {
        cursors.value.push(createCursor(userId, userData))
      }
    }

    isInitialized.value = true
  })

  const initLocalCursorFromSession = async () => {
    return new Promise((resolve) => {
      watch(() => isInitialized.value, async (newVal) => {
        if (newVal) {
          await initializeLocalCursor()
          resolve(true)
        }
      }, { immediate: true })
    })
  }

  const initializeLocalCursor = () => {
    const storedUserId = sessionStorage.getItem('multiplayerUserId')

    const createNewCursor = () => {
      const unusedEmojis = EMOJIS.filter(emoji => !cursors.value.some(cursor => cursor.name === emoji))
      const name = gsap.utils.shuffle(unusedEmojis).pop()
      createLocalCursor(name)
    }

    if (!storedUserId) {
      createNewCursor()
      return Promise.resolve(true)
    } else {
      return new Promise((resolve) => {
        onValue(fbRef(db, `users/${storedUserId}`), (snapshot) => {
          const userData = snapshot.val()

          if (userData) {
            localUserId.value = storedUserId
            localCursor.value = createCursor(localUserId.value, userData)
            resolve(true)
          } else {
            createNewCursor()
            resolve(true)
          }
        })
      })
    }
  }

  const createLocalCursor = (name) => {
    console.log({ db, localUserId: localUserId.value, localCursor: localCursor.value })
    const color = `hsl(${Math.random() * 360}, 100%, 20%)`

    localUserId.value = name.toLowerCase().replace(/\s/g, '-') + '-' + Date.now()
    sessionStorage.setItem('multiplayerUserId', localUserId.value)

    if (!db) {
      return
    }

    localCursor.value = {
      name,
      color,
      x: null,
      y: null,
      cursorCount: 4,
      chatMessage: null,
      explode: false,
      lastActive: Date.now(),
      isActive: true,
    }

    updateLocalCursorInDb()
  }

  const removeLocalCursor = () => {
    if (!db || !localUserId.value || !localCursor.value) {
      return
    }


    // set(fbRef(db, `users/${localUserId.value}`), null)
    localUserId.value = null
  }

  const setActiveStatus = (isActive = true) => {
    if (!db || !localUserId.value || !localCursor.value) {
      return
    }


    localCursor.value.isActive = isActive ?? true

    updateLocalCursorInDb()
  }

  const updateLocalCursorPosition = (x, y) => {
    if (!db || !localUserId.value || !localCursor.value) {
      return
    }


    localCursor.value.x = x
    localCursor.value.y = y

    updateLocalCursorInDb()
  }

  let resetCursorCountTimeout = null

  const triggerLocalCursorExplode = () => {
    if (!db || !localUserId.value || !localCursor.value) {
      return
    }


    clearTimeout(resetCursorCountTimeout)

    localCursor.value.cursorCount = Math.max(((localCursor.value.cursorCount || 5) + 1) % 20, 5)
    localCursor.value.explode = true

    resetCursorCountTimeout = setTimeout(() => {
      localCursor.value.cursorCount = 4
      updateLocalCursorInDb()
    }, 2000)

    updateLocalCursorInDb()

    setTimeout(() => {
      localCursor.value.explode = false
      updateLocalCursorInDb()
    }, 100)
  }

  const setChatMessage = (message) => {
    if (!db || !localUserId.value || !localCursor.value) {
      return
    }

    localCursor.value.chatMessage = message

    updateLocalCursorInDb()
  }

  return {
    app,
    createLocalCursor,
    cursors,
    initLocalCursorFromSession,
    localCursor,
    localUserId,
    removeLocalCursor,
    setActiveStatus,
    triggerLocalCursorExplode,
    updateLocalCursorPosition,
    setChatMessage,
  }
})
