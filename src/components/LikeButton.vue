<template>
  <el-button
    class="like-btn"
    :type="modelValue ? 'primary' : 'default'"
    size="small"
    plain
    round
    @click="onLike"
  >
    <el-icon><Pointer /></el-icon>
    <span>{{ modelValue ? "已赞" : "点赞" }} · {{ count }}</span>
  </el-button>
</template>

<script setup>
import { Pointer } from "@element-plus/icons-vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  count: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(["update:modelValue", "toggle"]);

const onLike = (e) => {
  e?.stopPropagation?.();

  const nextLiked = !props.modelValue;

  // 1️⃣ 正确更新 v-model
  emit("update:modelValue", nextLiked);

  // 2️⃣ 把 nextLiked 明确传给父组件
  emit("toggle", nextLiked);
};
</script>

<style scoped>
.like-btn {
  border-radius: 999px;
}
</style>
