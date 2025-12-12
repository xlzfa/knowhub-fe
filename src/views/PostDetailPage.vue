<template>
  <div class="page-wrap layout">
    <div class="main card detail-card" v-if="post">
      <div class="title-row">
        <div>
          <div class="title">{{ post.title }}</div>
          <div class="muted">
            {{ post.author.name }} · {{ post.createdAt }} · {{ post.tags.join(" / ") }}
          </div>
        </div>
        <LikeButton :count="post.likes" @like="onLike" />
      </div>
      <div class="content">{{ post.content }}</div>
      <div class="meta muted">浏览 {{ Math.floor(post.hotScore * 10) }} · 评论 {{ post.comments }}</div>
    </div>
    <div class="side">
      <SidebarHot />
    </div>
  </div>
  <div class="page-wrap" v-if="post">
    <CommentList :post-id="post.id" :comments="comments" />
  </div>
  <div class="page-wrap" v-else>
    <el-empty description="帖子不存在或已删除" />
  </div>
</template>

<script setup lang="js">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import LikeButton from "../components/LikeButton.vue";
import SidebarHot from "../components/SidebarHot.vue";
import CommentList from "../components/CommentList.vue";
import { usePostStore } from "../stores/posts";

const route = useRoute();
const postStore = usePostStore();
const { currentPost: post, postComments } = storeToRefs(postStore);

const postId = computed(() => Number(route.params.id));
const comments = computed(() => postComments.value[postId.value] || []);

onMounted(() => {
  postStore.loadPostDetail(postId.value).catch(() => {
    ElMessage.error("获取帖子详情失败，请连接后端接口");
  });
});

const onLike = () => postStore.likePost(postId.value);
</script>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 18px;
}

.detail-card {
  padding: 20px;
}

.title-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2d3d;
}

.content {
  margin: 16px 0;
  line-height: 1.8;
  color: #3a3f4c;
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
  .title-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

