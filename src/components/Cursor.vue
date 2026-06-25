<template>
  <div ref="elCursor" class="cursor" :style="{ color }" aria-hidden="true">
    <span class="name">{{ name }}</span>

    <span class="name clone" v-for="i in clonesCount" :key="i" ref="elsClones" aria-hidden="true">{{ name }}</span>

    <div v-if="!isActive" class="sleep">
      <span>z</span>
      <span>z</span>
      <span>z</span>
      <span>z</span>
      <span>z</span>
    </div>

    <ChatBubble :chatMessage="chatMessage" :isActive="!!chatMessage" :color="color"
      :style="{ left: '0.75rem', top: '-2.25rem' }" />
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
        const distance = gsap.utils.random(80, 140)
        const rotate = gsap.utils.random(0, 360)
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
.cursor {
  font-family: monospace;
  position: absolute;
  top: 0;
  left: 0;
  height: 2rem;
  width: 2rem;
  display: grid;
  pointer-events: none;
  z-index: 999999999;

  * {
    grid-area: 1 / 1 / 2 / 2;
  }
}

.sleep {
  position: absolute;
  display: flex;
  flex-direction: column;
  font-size: 8px;
  line-height: 0.6;
  bottom: calc(100% + 0.5rem);
  left: -1rem;

  @starting-style {
    opacity: 0;
  }

  span {
    display: block;
    text-shadow: 0 0 2px white;
    opacity: 0;
    animation: sleep 2.5s ease-in-out infinite;

    &:nth-child(1) {
      margin-left: -1.2em;
      animation-delay: 12.8s;
      font-size: 14px;
    }

    &:nth-child(2) {
      font-size: 12px;
      margin-left: -0.65em;
      animation-delay: 7.6s;
    }

    &:nth-child(3) {
      font-size: 10px;
      margin-left: -1.3em;
      animation-delay: 4.9s;
    }

    &:nth-child(4) {
      margin-left: -0.75em;
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

.name {
  font-size: 1.75rem;
  line-height: 1;
  text-box: trim-both cap alphabetic;
  text-shadow: 0.5px 0.5px white, -0.5px 0.5px white, -0.5px -0.5px white, 0.5px -0.5px white;
  white-space: nowrap;
  margin-top: 0.25rem;
  transform: translate(-50%, -50%);

}

.clone {
  z-index: -1;
}
</style>