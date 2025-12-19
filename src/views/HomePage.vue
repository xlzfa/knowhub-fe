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
            <PostCard v-for="item in displayedPosts" :key="item.id" :post="item" />
          </div>
          <div ref="bottomSentinel" style="height:1px"></div>
          <div style="text-align:center; margin-top:12px;" v-if="loadingMore">加载中...</div>
    </div>
    <div class="side">
      <SidebarHot />
    </div>
  </div>
</template>

<script setup lang="js">
import { computed, onMounted, ref, onBeforeUnmount, nextTick } from "vue";
import { Refresh } from "@element-plus/icons-vue";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import PostCard from "../components/PostCard.vue";
import SidebarHot from "../components/SidebarHot.vue";
import PaginationBar from "../components/PaginationBar.vue";
import { usePostStore } from "../stores/posts";

const postStore = usePostStore();
const { posts } = storeToRefs(postStore);
const pageSize = 10;
const visibleCount = ref(pageSize);
const loadingMore = ref(false);

const displayedPosts = computed(() => posts.value.slice(0, visibleCount.value));

let lastCheck = 0;
const onScroll = () => {
  const now = Date.now();
  if (now - lastCheck < 200) return;
  lastCheck = now;
  const scrollTop = window.scrollY || window.pageYOffset;
  const viewportHeight = window.innerHeight;
  const fullHeight = document.documentElement.scrollHeight;
  if (scrollTop + viewportHeight + 200 >= fullHeight) {
    loadMore();
  }
};

const bottomSentinel = ref(null);
let observer = null;
const createObserver = () => {
  if (!('IntersectionObserver' in window) || !bottomSentinel.value) return;
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      console.log('IntersectionObserver entry', entry.isIntersecting, entry.intersectionRatio, entry.boundingClientRect);
          if (entry.isIntersecting) {
            console.log('sentinel intersecting -> loadMore');
        loadMore();
      }
    });
  }, { root: null, rootMargin: '200px', threshold: 0 });
  observer.observe(bottomSentinel.value);
};

const loadMore = async () => {
  if (loadingMore.value) return;
  if (postStore.loading) return; // 避免与正在进行的 loadPosts 冲突
  if (visibleCount.value >= posts.value.length) {
    loadingMore.value = true;
    try {
      if (typeof postStore.loadMorePosts === "function") {
        await postStore.loadMorePosts();
      } else {
        // fallback: request next page via loadPosts (now appends when page>1)
        const nextPage = Number(postStore.page) + 1;
        await postStore.loadPosts(nextPage, pageSize);
      }
    } catch (e) {
      ElMessage.error("加载更多失败");
    } finally {
      loadingMore.value = false;
    }
    visibleCount.value = posts.value.length;
    return;
  }
  visibleCount.value += pageSize;
};

const refresh = () =>
  postStore.loadPosts().catch(() => ElMessage.error("加载帖子失败，请连接后端接口"));

onMounted(async () => {
  console.log('HomePage mounted, posts.length=', posts.value.length);
  if (!posts.value.length) {
    try {
      await postStore.loadPosts();
    } catch (e) {
      console.error(e);
      ElMessage.error("加载帖子失败，请连接后端接口");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  // wait next tick to ensure sentinel is rendered, then create observer
  await nextTick();
  createObserver();
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
  if (observer && bottomSentinel.value) observer.unobserve(bottomSentinel.value);
});
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

