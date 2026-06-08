import { ref } from 'vue'
import { defineStore } from 'pinia'
import { initializeApp } from 'firebase/app'
import { getDatabase, set, ref as fbRef, onValue } from 'firebase/database'

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
  }
}

export const useMultiplayerStore = defineStore('multiplayer', () => {
  const app = ref(initializeFirebase())
  const cursors = ref([])
  const db = getDatabase(app.value)
  const localCursor = ref(null)
  const localUserId = ref(null)
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
  })

  const initLocalCursorFromSession = () => {
    const storedUserId = sessionStorage.getItem('multiplayerUserId')

    if (!storedUserId) {
      console.log('no stored user ID found in session')
      return false
    }

    localUserId.value = storedUserId

    onValue(fbRef(db, `users/${localUserId.value}`), (snapshot) => {
      const userData = snapshot.val()

      if (userData) {
        localCursor.value = createCursor(localUserId.value, userData)
      }
    })

    return true
  }

  const createLocalCursor = (name) => {
    localUserId.value = sessionStorage.getItem('multiplayerUserId')
    const color = `hsl(${Math.random() * 360}, 100%, 30%)`

    if (!localUserId.value) {
      localUserId.value = name.toLowerCase().replace(/\s/g, '-') + '-' + Date.now()
      sessionStorage.setItem('multiplayerUserId', localUserId.value)
    }

    checkInitialised()

    localCursor.value = {
      name,
      color,
      x: null,
      y: null,
      cursorCount: 4,
      explode: false,
      lastActive: Date.now(),
      isActive: true,
    }

    updateLocalCursorInDb()
  }

  const removeLocalCursor = () => {
    checkInitialised()

    set(fbRef(db, `users/${localUserId.value}`), null)
    localUserId.value = null
  }

  const setActiveStatus = (isActive = true) => {
    checkInitialised()

    localCursor.value.isActive = isActive ?? true

    updateLocalCursorInDb()
  }

  const updateLocalCursorPosition = (x, y) => {
    checkInitialised()

    localCursor.value.x = x
    localCursor.value.y = y

    updateLocalCursorInDb()
  }

  let resetCursorCountTimeout = null

  const triggerLocalCursorExplode = () => {
    checkInitialised()

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

  const checkInitialised = () => {
    if (!db) {
      console.error('Database not initialized')
      return
    }

    if (!localUserId.value) {
      console.error('Local user ID not set')
      return
    }
  }

  return {
    app,
    createLocalCursor,
    cursors,
    initLocalCursorFromSession,
    localUserId,
    removeLocalCursor,
    setActiveStatus,
    triggerLocalCursorExplode,
    updateLocalCursorPosition,
  }
})
