<template>
  <div class="card post-card" @click="onCardClick">
    <!-- answer style (来自后端的 answer row) -->
    <template v-if="isAnswer">
      <div class="post-header">
        <div class="title question-title">{{ questionTitle }}</div>
        <div class="meta">
          <span class="muted">回答 · {{ formattedDate }}</span>
        </div>
      </div>

      <div class="summary">
        <span> {{ user }}: {{ displayContent }}</span>
        <template v-if="isTruncated">
          <a class="detail-link" @click.stop.prevent="expanded = true"> 阅读全文</a>
        </template>
        <template v-else-if="expanded">
          <a class="detail-link" @click.stop.prevent="expanded = false"> 收起</a>
        </template>
      </div>
      <div class="footer flex-between">
        <LikeButton v-model="liked" :count="post.likeCount" @toggle="onToggle" />
      </div>
    </template>

    <!-- original post style -->
    <!-- <template v-else>
      <div class="post-header">
        <div class="title">{{ post.title }}</div>
        <div class="meta">
          <span>{{ post.author?.name }}</span>
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
    </template> -->
  </div>
</template>

<script setup lang="js">
import { useRouter } from "vue-router";
import LikeButton from "./LikeButton.vue";
import { usePostStore } from "../stores/posts";
import { useUserStore } from "../stores/user";

const props = defineProps({
  post: { type: Object, required: true }
});
const router = useRouter();
const postStore = usePostStore();
import { computed, ref, watchEffect } from "vue";

const expanded = ref(false);

const isAnswer = computed(() => {
  // 后端字段名拼写为 quertionTitle；也兼容 questionTitle
  return Boolean(props.post && (props.post.quertionTitle || props.post.questionTitle));
});

const questionTitle = computed(() => props.post.quertionTitle || props.post.questionTitle || "");

const user = computed(() => props.post.user || props.post.author || {});

const fullContent = computed(() => props.post.content || props.post.summary || "");

const maxLen = 100;
const isTruncated = computed(() => !expanded.value && fullContent.value.length > maxLen);
const displayContent = computed(() => {
  if (expanded.value) return fullContent.value;
  return fullContent.value.length > maxLen ? fullContent.value.slice(0, maxLen) + "..." : fullContent.value;
});

const formattedDate = computed(() => {
  const t = props.post.createTime || props.post.createdAt;
  return t ? new Date(t).toLocaleString() : "";
});

const goDetail = (id) => router.push({ name: "post-detail", params: { id } });
const onToggle = async () => {
  console.log("PostCard:onToggle", { id: props.post.id, liked: liked.value });
  if(!useUserStore().isLoggedIn) {
    router.push({ name: "login" })
    return;
  }
  try {
    await postStore.likePost(props.post.id, liked.value);
    console.log("PostCard:onToggle done", { id: props.post.id });
  } catch (e) {
    console.warn("点赞同步失败", e);
  }
};

const liked = ref(Boolean(props.post.liked));
watchEffect(() => {
  liked.value = Boolean(props.post.liked);
});

const onCardClick = (e) => {
  // 点击详情/收起不会触发跳转，因为链接上带有 stop.prevent
  if (isAnswer.value) {
    return;
  }
  goDetail(props.post.id);
};
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


.detail-link {
  display: inline-block;
  margin-left: 6px;
  color: #175199;              /* 知乎蓝 */
  font-size: 14px;
  line-height: 1.6;
  cursor: pointer;
  user-select: none;
  text-decoration: none;
  vertical-align: baseline;
}

.detail-link:hover {
  color: #0f3c75;
  text-decoration: underline;
}

</style>

