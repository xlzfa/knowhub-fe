<template>
  <div class="card post-card" @click="goDetail(post.id)">
    <div class="post-header">
      <div class="title">{{ post.title }}</div>
      <div class="meta">
        <span>{{ post.author.name }}</span>
        <span>· {{ post.createdAt }}</span>
      </div>
    </div>
    <div class="summary">{{ post.summary }}</div>
    <div class="tags">
      <span v-for="tag in post.tags" :key="tag" class="tag"># {{ tag }}</span>
    </div>
    <div class="footer flex-between">
      <div class="muted">{{ post.likes }} 赞 · {{ post.comments }} 评论</div>
      <LikeButton :count="post.likes" @like.stop="onLike" />
    </div>
  </div>
</template>

<script setup lang="js">
import { useRouter } from "vue-router";
import LikeButton from "./LikeButton.vue";
import { usePostStore } from "../stores/posts";

const props = defineProps({
  post: { type: Object, required: true }
});
const router = useRouter();
const postStore = usePostStore();

const goDetail = (id) => router.push({ name: "post-detail", params: { id } });
const onLike = () => postStore.likePost(props.post.id);
</script>

<style scoped>
.post-card {
  padding: 18px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.06);
}

.post-header .title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2d3d;
}

.meta {
  margin-top: 4px;
  color: #8a8f9c;
  font-size: 13px;
}

.summary {
  margin: 12px 0;
  color: #3a3f4c;
  line-height: 1.6;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.footer {
  border-top: 1px solid #eef0f6;
  padding-top: 10px;
}
</style>

