<template>
  <teleport to="body">
    <div class="modal-overlay" @click.self="close">
      <div class="modal-body" role="dialog" aria-modal="true">
        <button class="modal-close" @click="close">✕</button>
        <div class="modal-content">
          <slot />
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { defineEmits } from 'vue'
const emit = defineEmits(['close'])
const close = () => emit('close')
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2200;
  padding: 24px;
}
.modal-body {
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow: auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
  position: relative;
  padding: 20px;
}
.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
}
.modal-content {
  padding-top: 8px;
}
</style>