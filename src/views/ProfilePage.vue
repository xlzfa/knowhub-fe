<template>
  <div class="page-wrap layout">
    <div class="main">
      <div class="card profile-card">
        <div class="user-row">
          <el-avatar :src="user?.avatar" size="large" />
          <div>
            <div class="name">{{ user?.name }}</div>
            <div class="muted">{{ user?.title || user?.bio }}</div>
          </div>
        </div>
        <div class="muted" style="margin-top: 8px">
          {{ user?.bio || "欢迎来到 KonwHub，一起交流知识。" }}
        </div>
      </div>
      <div class="card list-card">
        <div class="section-title">我的帖子</div>
        <div class="space-y-12">
          <PostCard v-for="item in myPosts" :key="item.id" :post="item" />
        </div>
      </div>
      <div class="card list-card">
        <div class="section-title">我的评论</div>
        <div v-if="myComments.length">
          <div v-for="item in myComments" :key="item.id" class="comment-item">
            <div class="muted">{{ item.createdAt }}</div>
            <div class="content">{{ item.content }}</div>
          </div>
        </div>
        <el-empty v-else description="还没有评论" />
      </div>
    </div>
    <div class="side">
      <SidebarHot />
    </div>
  </div>
</template>

<script setup lang="js">
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import SidebarHot from "../components/SidebarHot.vue";
import PostCard from "../components/PostCard.vue";
import { useUserStore } from "../stores/user";
import { usePostStore } from "../stores/posts";

const { currentUser: user } = storeToRefs(useUserStore());
const postStore = usePostStore();
const { posts, postComments } = storeToRefs(postStore);

onMounted(() => {
  if (!posts.value.length) postStore.loadPosts();
});

const myPosts = computed(() =>
  posts.value.filter((p) => p.author.name === user.value?.name)
);

const myComments = computed(() => {
  const all = Object.values(postComments.value || {}).flat();
  return all.filter((c) => c.author.name === user.value?.name);
});
</script>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 18px;
}

.profile-card,
.list-card {
  padding: 18px;
}

.user-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.name {
  font-size: 18px;
  font-weight: 700;
}

.comment-item {
  padding: 10px 0;
  border-bottom: 1px solid #f1f2f6;
}

@media (max-width: 960px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>

