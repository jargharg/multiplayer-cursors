<template>
  <div ref="elCursor" class="cursor-wrapper" :style="{ color }" aria-hidden="true">
    <svg viewBox="11 10 8 15" :class="['cursor', isActive ? '' : 'active']">
      <defs>
        <g id="cursor">
          <path fill="#fff" d="m16.1 25.5 2-1 1.5-.9-2.5-4.8h4.3L10 7.4v16l3.3-3.2z" />
          <path fill="currentColor" d="m16.4 24 1.8-1-2.8-5.1H19l-8-8V21l2.5-2.4z" />
        </g>
      </defs>

      <use ref="elsClones" href="#cursor" class="clone" v-for="i in clonesCount" :key="i" />

      <use href="#cursor" />
    </svg>

    <span class="name">{{ name }}</span>

    <div v-if="!isActive" class="sleep">
      <span>z</span>
      <span>z</span>
      <span>z</span>
      <span>z</span>
      <span>z</span>
    </div>

    <ChatBubble :chatMessage="chatMessage" :isActive="!!chatMessage" :color="color"
      :style="{ left: '14px',  top: '20px' }" />
  </div>
</template>

<script>
import gsap from 'gsap'
import { nextTick, onMounted, ref, watch } from 'vue'
import ChatBubble from './ChatBubble.vue';

export default {
  components: {
    ChatBubble,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    x: {
      type: Number,
      default: null,
    },
    y: {
      type: Number,
      default: null,
    },
    name: {
      type: String,
      default: 'Unknown',
    },
    color: {
      type: String,
      default: '#000',
    },
    explode: {
      type: Boolean,
      default: false,
    },
    cursorCount: {
      type: Number,
      default: 5,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    chatMessage: {
      type: String,
      default: '',
    },
  },

  setup(props) {
    const elCursor = ref(null)
    const clonesCount = ref(0)
    const elsClones = ref([])
    let explodeTl

    const triggerExplode = async () => {
      clonesCount.value = props.cursorCount

      await nextTick()

      if (explodeTl) explodeTl.kill()

      explodeTl = gsap.timeline({
        onComplete: () => {
          clonesCount.value = 0
        },
      })

      elsClones.value.reverse().forEach((clone, index) => {
        const a = (index / elsClones.value.length) * 360
        const angleOffset = gsap.utils.random(-10, 10)
        const angle = a + angleOffset
        const distance = gsap.utils.random(40, 60)
        const rotate = gsap.utils.random(-10, 10)
        const ease = 'circ.out'
        const duration = gsap.utils.random(1.5, 2.5)

        const { x, y } = {
          x: Math.cos((angle * Math.PI) / 180) * distance,
          y: Math.sin((angle * Math.PI) / 180) * distance,
        }

        explodeTl
          .fromTo(clone, { x: 0, y: 0, opacity: 1, rotate: 0 }, { x, y, rotate, opacity: 0, ease, duration }, 0)
      })
    }

    onMounted(() => {
      const xQuickTo = gsap.quickTo(elCursor.value, 'x', { duration: 0.5, ease: 'power3' })
      const yQuickTo = gsap.quickTo(elCursor.value, 'y', { duration: 0.5, ease: 'power3' })

      watch(() => props.x, (newX = 0) => {
        xQuickTo(`${newX * document.documentElement.scrollWidth}`)
      })

      watch(() => props.y, (newY = 0) => {
        yQuickTo(`${newY * document.documentElement.scrollHeight}`)
      })

      watch(() => props.explode, (explode) => {
        if (explode) triggerExplode()
      })
    })

    return { elCursor, clonesCount, elsClones }
  },
}
</script>

<style>
.cursor-wrapper {
  font-family: monospace;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  gap: 4px;
  align-items: center;
  pointer-events: none;
  z-index: 999999999;
}

.sleep {
  position: absolute;
  bottom: 100%;
  display: grid;
  font-size: 8px;
  line-height: 0.6;
  margin-bottom: -1.5em;
  bottom: 100%;
  left: -1.25em;

  @starting-style {
    opacity: 0;
  }

  span {
    display: block;
    text-shadow: 0 0 2px white;
    opacity: 0;
    animation: sleep 2.5s ease-in-out infinite;

    &:nth-child(1) {
      margin-left: -1.5em;
      animation-delay: 12.8s;
    }

    &:nth-child(2) {
      margin-left: -0.5em;
      animation-delay: 7.6s;
    }

    &:nth-child(3) {
      margin-left: -1em;
      animation-delay: 4.9s;
    }

    &:nth-child(4) {
      margin-left: -0.5em;
      animation-delay: 2.2s;
    }

    &:nth-child(5) {
      animation-delay: 2.2s;
    }
  }
}

@keyframes sleep {

  0%,
  100% {
    opacity: 0;
    transform: translate(0, 0);
  }

  50% {
    opacity: 1;
    transform: translate(-2px, -1px);
  }
}

.cursor {
  height: 17px;
  pointer-events: none;
  overflow: visible;
  transform-origin: 40% 60%;

  &.active {
    transform: rotate(-90deg);
    transition: transform 2.3s;
    transition-timing-function: cubic-bezier(0.36, 0, 0.64, 1);
  }
}

.name {
  font-size: 10px;
  text-shadow: 0.5px 0.5px white, -0.5px 0.5px white, -0.5px -0.5px white, 0.5px -0.5px white;
  white-space: nowrap;
}
</style>