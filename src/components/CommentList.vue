<template>
  <div class="comment-card">
    <!-- 标题 -->
    <div class="section-title">
      评论 · {{ commentList.length }}
    </div>

    <!-- 评论编辑器 -->
    <div v-if="isLoggedIn" class="comment-editor">
      <el-input
        v-model="draft"
        type="textarea"
        :rows="3"
        maxlength="500"
        show-word-limit
        placeholder="写下你的评论…"
      />
      <div class="editor-footer">
        <span class="muted">理性发言，友善交流</span>
        <el-button
          type="primary"
          round
          size="small"
          :disabled="!draft.trim()"
          @click="submit"
        >
          发布
        </el-button>
      </div>
    </div>

    <!-- 未登录提示 -->
    <div v-else class="login-hint">
      <el-button link type="primary" @click="toLogin">
        登录后参与讨论
      </el-button>
    </div>

    <!-- 评论列表 -->
    <div class="comment-list">
      <div
        v-for="item in commentList"
        :key="item.id"
        class="comment-item"
      >
        <!-- 头像（后端没给 avatar，先兜底） -->
        <el-avatar
          size="small"
          class="avatar"
        >
          {{ item.username?.[0] || "?" }}
        </el-avatar>

        <!-- 主体 -->
        <div class="comment-main">
          <!-- 作者行 -->
          <div class="comment-header">
            <span class="author-name">
              {{ item.username || "匿名用户" }}
            </span>
            <span class="comment-time">
              {{ formatTime(item.createTime) }}
            </span>
          </div>

          <!-- 内容 -->
          <div class="comment-content">
            {{ item.content }}
          </div>

          <!-- 操作区（预留） -->
          <div class="comment-actions">
            <span class="action">回复</span>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!commentList.length" class="empty">
        还没有评论，快来抢沙发吧～
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";

import { useUserStore } from "../stores/user";
import { usePostStore } from "../stores/posts";

/* props：只需要 postId */
const props = defineProps({
  postId: { type: Number, required: true }
});

/* stores */
const userStore = useUserStore();
const postStore = usePostStore();
const { isLoggedIn, currentUser } = storeToRefs(userStore);
const { postComments } = storeToRefs(postStore);

const router = useRouter();

/* 当前评论列表（唯一来源：store） */
const commentList = computed(() => {
  return postComments.value[props.postId] || [];
});

/* 编辑器 */
const draft = ref("");

const parent_id = -1;

const submit = async () => {
  if (!draft.value.trim() || !currentUser.value) return;

  try {
    const ok = await postStore.addComment({
      userId: currentUser.value.id,
      answerId: props.postId,
      parentId: parent_id,
      content: draft.value,
  });

    if (ok) {
      draft.value = "";
      ElMessage.success("评论已发布");
    } else {
      ElMessage.warning("评论接口未接入");
    }
  } catch (err) {
    ElMessage.error(err?.message || "评论失败，请稍后再试");
  }
};

const toLogin = () => {
  router.push({
    name: "login",
    query: { redirect: router.currentRoute.value.fullPath }
  });
};

/* 时间格式化（简单版） */
const formatTime = (time) => {
  if (!time) return "";
  try {
    return new Date(time).toLocaleString();
  } catch {
    return time;
  }
};
</script>


<style scoped>
/* 整体 */
.comment-card {
  padding: 16px 0;
}

/* 标题 */
.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

/* 编辑器 */
.comment-editor {
  margin-bottom: 20px;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

/* 评论列表 */
.comment-list {
  display: flex;
  flex-direction: column;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-top: 1px solid var(--el-border-color-lighter);
}

.comment-item:first-child {
  border-top: none;
}

/* 头像 */
.avatar {
  flex-shrink: 0;
}

/* 主体 */
.comment-main {
  flex: 1;
}

/* 作者行 */
.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-name {
  font-size: 14px;
  font-weight: 500;
  color: #121212;
}

.comment-time {
  font-size: 12px;
  color: #8590a6;
}

/* 内容 */
.comment-content {
  margin: 8px 0;
  font-size: 14px;
  line-height: 1.6;
  color: #1a1a1a;
  white-space: pre-wrap;
}

/* 操作区（知乎风格：hover 显示） */
.comment-actions {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #8590a6;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.comment-item:hover .comment-actions {
  opacity: 1;
}

.action {
  cursor: pointer;
}

.action:hover {
  color: var(--el-color-primary);
}

/* 辅助 */
.muted {
  font-size: 12px;
  color: #8590a6;
}

.login-hint {
  margin: 12px 0;
}

.empty {
  padding: 24px 0;
  text-align: center;
  font-size: 13px;
  color: #999;
}
</style>
