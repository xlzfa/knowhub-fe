<template>
  <div class="page-wrap">
    <div class="section-title">热门帖子</div>
    <div class="card" style="padding: 16px">
      <div class="space-y-12">
        <PostCard v-for="item in hotPosts" :key="item.id" :post="item" />
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import PostCard from "../components/PostCard.vue";
import { usePostStore } from "../stores/posts";

const postStore = usePostStore();
const { hotPosts } = storeToRefs(postStore);

onMounted(() => {
  if (!hotPosts.value.length)
    postStore.loadHot().catch(() => ElMessage.error("获取热门列表失败，请连接后端接口"));
});
</script>

