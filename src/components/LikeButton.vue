<template>
  <el-button
    class="like-btn"
    :type="liked ? 'primary' : 'default'"
    size="small"
    plain
    round
    :disabled="disabled"
    @click="onClick"
  >
    <el-icon><Pointer /></el-icon>
    <span>{{ liked ? "已赞" : "点赞" }} · {{ count }}</span>
  </el-button>
</template>

<script setup>
import { Pointer } from "@element-plus/icons-vue";

const props = defineProps({
  liked: {
    type: Boolean,
    required: true
  },
  count: {
    type: Number,
    default: 0
  },
  disabled: Boolean
});

const emit = defineEmits(["toggle"]);

const onClick = (e) => {
  e?.stopPropagation?.();
  if (props.disabled) return;
  emit("toggle");
};
</script>

<style scoped>
.like-btn {
  border-radius: 999px;
}
</style>
