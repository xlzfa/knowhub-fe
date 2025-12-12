<template>
  <div class="page-wrap layout">
    <div class="main">
      <div class="section-title flex-between">
        <span>最新动态</span>
        <el-button text type="primary" @click="refresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
      <div class="space-y-12">
        <PostCard v-for="item in pagedPosts" :key="item.id" :post="item" />
      </div>
      <PaginationBar :total="posts.length" :current="page" :page-size="pageSize" @change="onPage" />
    </div>
    <div class="side">
      <SidebarHot />
    </div>
  </div>
</template>

<script setup lang="js">
import { computed, onMounted, ref } from "vue";
import { Refresh } from "@element-plus/icons-vue";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import PostCard from "../components/PostCard.vue";
import SidebarHot from "../components/SidebarHot.vue";
import PaginationBar from "../components/PaginationBar.vue";
import { usePostStore } from "../stores/posts";

const postStore = usePostStore();
const { posts } = storeToRefs(postStore);
const page = ref(1);
const pageSize = 5;

const pagedPosts = computed(() => {
  const start = (page.value - 1) * pageSize;
  return posts.value.slice(start, start + pageSize);
});

onMounted(() => {
  if (!posts.value.length)
    postStore.loadPosts().catch(() => ElMessage.error("加载帖子失败，请连接后端接口"));
});

const onPage = (p) => (page.value = p);
const refresh = () =>
  postStore.loadPosts().catch(() => ElMessage.error("加载帖子失败，请连接后端接口"));
</script>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 18px;
}

.main {
  min-width: 0;
}

.side {
  position: sticky;
  top: 90px;
  height: fit-content;
}

@media (max-width: 960px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .side {
    position: static;
  }
}
</style>

