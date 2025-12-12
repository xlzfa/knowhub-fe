<template>
  <div class="card hot-card">
    <div class="section-title flex-between">
      <span>今日热榜</span>
      <el-button text type="primary" size="small" @click="toHot">查看更多</el-button>
    </div>
    <div class="hot-list">
      <div v-for="(item, index) in hot" :key="item.id" class="hot-item" @click="goDetail(item.id)">
        <span class="rank">{{ index + 1 }}</span>
        <div class="meta">
          <div class="title">{{ item.title }}</div>
          <div class="muted">{{ item.likes }} 赞 · {{ item.comments }} 评论</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { onMounted } from "vue";
import { ElMessage } from "element-plus";
import { usePostStore } from "../stores/posts";

const router = useRouter();
const postStore = usePostStore();
const { hotPosts: hot } = storeToRefs(postStore);

onMounted(() => {
  if (!hot.value.length)
    postStore.loadHot().catch(() => ElMessage.error("获取热榜失败，请连接后端接口"));
});

const goDetail = (id) => router.push({ name: "post-detail", params: { id } });
const toHot = () => router.push({ name: "hot" });
</script>

<style scoped>
.hot-card {
  padding: 16px;
}

.hot-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hot-item {
  display: flex;
  gap: 10px;
  cursor: pointer;
  padding: 8px 6px;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.hot-item:hover {
  background: #f7f8fb;
}

.rank {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: #eef2ff;
  color: #304ffe;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 12px;
}

.title {
  font-weight: 600;
  color: #1f2d3d;
}
</style>

