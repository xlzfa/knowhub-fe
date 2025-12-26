<template>
  <!-- 整个列表中的一条“回答” -->
  <div class="card zh-answer-item" @click="onCardClick">
    <template v-if="isAnswer">
      <div style="margin-left: 20px;">
        <!-- 问题标题 -->
        <div class="answer-question">
          <a
            class="question-title"
            @click.stop.prevent="onQuestionClick"
          >
            {{ questionTitle }}
          </a>
        </div>

        <!-- 回答内容 -->
        <div class="answer-content">
          <strong class="answer-author">{{ user || "匿名" }}</strong>
          <span>：</span>
          <span>{{ displayContent }}</span>

          <template v-if="isTruncated">
            <a class="detail-link" @click.stop.prevent="expanded = true">阅读全文</a>
          </template>
          <template v-else-if="expanded">
            <a class="detail-link" @click.stop.prevent="expanded = false">收起</a>
          </template>
        </div>

        <!-- 时间 -->
        <div class="answer-meta muted">
          编辑于 {{ formattedDate }}
        </div>

        <!-- 操作区（点赞 + 评论） -->
        <div class="answer-actions">
          <LikeButton
            v-if="showLike"
            class="zh-like"
            v-model="liked"
            :count="post.likeCount || 0"
            @toggle="onToggle"
          />

          <button
            class="comment-btn zhihu"
            @click.stop.prevent="toggleComments(post.id)"
          >
            {{ showComments[post.id] ? "隐藏评论" : "评论" }}
            · {{ (postComments[post.id] || []).length }}
          </button>
        </div>

        <!-- 评论区（按需挂载，知乎同款） -->
        <CommentList
          v-if="showComments[post.id]"
          :post-id="post.id"
          :comments="postComments[post.id] || []"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="js">
import { useRouter } from "vue-router";
import { computed, ref, reactive, watchEffect } from "vue";

import LikeButton from "./LikeButton.vue";
import CommentList from "../components/CommentList.vue";
import { usePostStore } from "../stores/posts";
import { useUserStore } from "../stores/user";
import { storeToRefs } from "pinia";

const props = defineProps({
  post: { type: Object, required: true },
  showLike: { type: Boolean, default: true }
});

const router = useRouter();
const postStore = usePostStore();
const { postComments } = storeToRefs(postStore);

const expanded = ref(false);

/* ===== 评论展开状态（与回答区一致） ===== */
const showComments = reactive({});

/* ===== 是否是回答 ===== */
const isAnswer = computed(() => {
  if (!props.post) return false;
  if (props.post.questionId != null) return true;
  if (props.post.question?.id != null) return true;
  return Boolean(props.post.quertionTitle || props.post.questionTitle);
});

/* ===== 题目 ===== */
const questionTitle = computed(
  () => props.post.quertionTitle || props.post.questionTitle || ""
);

const questionId = computed(() => {
  return (
    props.post.questionId ||
    props.post.question?.id ||
    props.post.question_id ||
    null
  );
});

const user = computed(() => props.post.user || props.post.author || "");

const fullContent = computed(() => props.post.content || props.post.summary || "");

const maxLen = 100;
const isTruncated = computed(
  () => !expanded.value && fullContent.value.length > maxLen
);

const displayContent = computed(() => {
  if (expanded.value) return fullContent.value;
  return fullContent.value.length > maxLen
    ? fullContent.value.slice(0, maxLen) + "..."
    : fullContent.value;
});

const formattedDate = computed(() => {
  const t = props.post.createTime || props.post.createdAt;
  return t ? new Date(t).toLocaleString() : "";
});

const goDetail = (id) =>
  router.push({ name: "post-detail", params: { id } });

const onQuestionClick = () => {
  goDetail(questionId.value || props.post.id);
};

/* ===== 点赞 ===== */
const liked = ref(Boolean(props.post.liked));
watchEffect(() => {
  liked.value = Boolean(props.post.liked);
});

const onToggle = async () => {
  if (!useUserStore().isLoggedIn) {
    router.push({ name: "login" });
    return;
  }
  await postStore.likePost(props.post.id, liked.value);
};

/* ===== 评论切换（核心改造） ===== */
const toggleComments = (id) => {
  showComments[id] = !showComments[id];

  // 与回答区一致：首次展开时初始化评论容器
  if (showComments[id] && !postComments.value[id]) {
    postComments.value[id] = [];
    // 如果你有接口，这里可以换成：
    // postStore.loadComments(id)
  }
};

const onCardClick = () => {
  // 回答列表不整体跳转
};
</script>

<style scoped>
/* ===== 整体回答流（不是卡片） ===== */
.zh-answer-item {
  background-color: #fff;
  padding: 16px 0;
  border-bottom: 1px solid #eef0f6;
}

/* ===== 问题标题 ===== */
.answer-question {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.question-title {
  color: #1f2d3d;
  cursor: pointer;
}

.question-title:hover {
  color: #175199;
}

/* ===== 回答正文 ===== */
.answer-content {
  font-size: 15px;
  line-height: 1.7;
  color: #333;
}

.answer-author {
  font-weight: 600;
}

/* ===== 时间 ===== */
.answer-meta {
  margin-top: 6px;
  font-size: 13px;
  color: #8a8f9c;
}

/* ===== 操作区 ===== */
.answer-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 8px;
}

/* 评论按钮 */
.comment-btn.zhihu {
  background: none;
  border: none;
  padding: 0;
  font-size: 13px;
  color: #8590a6;
  cursor: pointer;
}

.comment-btn:hover {
  text-decoration: underline;
}

/* 展开 / 收起 */
.detail-link {
  margin-left: 6px;
  color: #175199;
  cursor: pointer;
}

.detail-link:hover {
  text-decoration: underline;
}
</style>
