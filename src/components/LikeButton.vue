<template>
  <el-button class="like-btn" :type="liked ? 'primary' : 'default'" size="small" @click="onLike" plain round>
    <el-icon><Pointer /></el-icon>
    <span>{{ liked ? "已赞" : "点赞" }} · {{ count }}</span>
  </el-button>
</template>

<script setup lang="js">
import { computed, ref, watchEffect } from "vue";
import { Pointer } from "@element-plus/icons-vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  count: { type: Number, default: 0 }
});

const emit = defineEmits(["update:modelValue", "like"]);

const internalLiked = ref(false);

watchEffect(() => {
  internalLiked.value = props.modelValue ?? false;
});

const liked = computed(() => internalLiked.value);
const onLike = () => {
  internalLiked.value = true;
  emit("update:modelValue", true);
  emit("like");
};
</script>

<style scoped>
.like-btn {
  border-radius: 999px;
}
</style>

