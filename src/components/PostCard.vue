<template>
  <!-- 整个列表中的一条“回答” -->
  <div class="card zh-answer-item">
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

          <!-- Markdown 包裹层 -->
          <div
            ref="contentRef"
            class="answer-md-wrapper"
            :class="{ expanded }"
            @load.capture="recalcHeight"
          >
            <MdPreview
              class="answer-md"
              :modelValue="fullContent"
            />

            <!-- 底部渐变遮罩（纯视觉，不可点） -->
            <div
              v-if="canExpand && !expanded"
              class="expand-mask"
            ></div>
          </div>

          <!-- 展开 / 收起 控制 -->
          <div v-if="canExpand" class="expand-action">
            <a
              v-if="!expanded"
              class="expand-text"
              @click.stop.prevent="expanded = true"
            >
              展开全文
            </a>

            <a
              v-else
              class="collapse-text"
              @click.stop.prevent="expanded = false"
            >
              收起
            </a>
          </div>
        </div>

        <!-- 时间 -->
        <div class="answer-meta">
          编辑于 {{ formattedDate }}
        </div>

        <!-- 操作区 -->
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
            · {{ commentCount }}
          </button>
        </div>

        <!-- 评论区 -->
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
import { computed, ref, reactive, watchEffect, onMounted, nextTick } from "vue";
import { MdPreview } from "md-editor-v3";
import "md-editor-v3/lib/preview.css";

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
const contentRef = ref(null);
const canExpand = ref(false);


const commentCount = computed(() => {
  return props.post.comments?.total ?? 0;
});



/* ===== 评论展开状态 ===== */
const showComments = reactive({});

/* ===== 是否是回答 ===== */
const isAnswer = computed(() => {
  if (!props.post) return false;
  return Boolean(
    props.post.questionId ||
    props.post.question?.id ||
    props.post.questionTitle ||
    props.post.quertionTitle
  );
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

const formattedDate = computed(() => {
  const t = props.post.createTime || props.post.createdAt;
  return t ? new Date(t).toLocaleString() : "";
});

const onQuestionClick = () => {
  router.push({ name: "post-detail", params: { id: questionId.value || props.post.id } });
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

/* ===== 评论切换 ===== */
const toggleComments = (id) => {
  showComments[id] = !showComments[id];
  if (showComments[id] && !postComments.value[id]) {
    postComments.value[id] = [];
  }
};

/* ===== 是否需要展开 ===== */
onMounted(async () => {
  await nextTick();
  recalcHeight();
});

const recalcHeight = () => {
  if (!contentRef.value) return;
  const el = contentRef.value;
  canExpand.value = el.scrollHeight > el.clientHeight + 4;
};
</script>




<style scoped>
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

/* ===== Markdown 画幅控制 ===== */
.answer-md-wrapper {
  max-height: 120px; /* 👈 控制默认高度 */
  overflow: hidden;
  position: relative;
}

.answer-md-wrapper.expanded {
  max-height: none;
}

/* ===== Markdown 图片限制 ===== */
.answer-md :deep(img) {
  max-width: 100%;
  max-height: 480px;
  object-fit: cover;
  display: block;
  margin: 12px 0;
  border-radius: 6px;
}

/* ===== 遮罩：只做视觉，不可点击 ===== */
.expand-mask {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 64px;

  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 0.96)
  );

  pointer-events: none;
}

/* ===== 展开 / 收起 行为区 ===== */
.expand-action {
  margin-top: 6px;
}

.expand-text {
  font-size: 14px;
  color: #175199;
  cursor: pointer;
}

.expand-text:hover {
  text-decoration: underline;
}

.collapse-text {
  font-size: 14px;
  color: #8590a6;
  cursor: pointer;
}

.collapse-text:hover {
  text-decoration: underline;
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

/* ===== 评论按钮 ===== */
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
</style>
