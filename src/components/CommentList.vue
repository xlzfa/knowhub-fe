<template>
  <div class="card comment-card">
    <div class="section-title">评论 · {{ comments.length }}</div>
    <div v-if="isLoggedIn" class="comment-editor">
      <el-input
        v-model="draft"
        type="textarea"
        :rows="3"
        maxlength="500"
        show-word-limit
        placeholder="分享你的看法..."
      />
      <div class="flex-between" style="margin-top: 8px">
        <span class="muted">文明发言，理性讨论</span>
        <el-button type="primary" round :disabled="!draft.trim()" @click="submit">发布</el-button>
      </div>
    </div>
    <div v-else class="login-hint">
      <el-button link type="primary" @click="toLogin">登录后发表评论</el-button>
    </div>
    <div class="comment-list">
      <div v-for="item in comments" :key="item.id" class="comment-item">
        <div class="avatar">
          <el-avatar :src="item.author.avatar" size="small" />
        </div>
        <div class="body">
          <div class="name-row">
            <span class="name">{{ item.author.name }}</span>
            <span class="muted">{{ item.createdAt }}</span>
          </div>
          <div class="content">{{ item.content }}</div>
          <div class="muted">赞 {{ item.likes }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import { useUserStore } from "../stores/user";
import { usePostStore } from "../stores/posts";

const props = defineProps({
  postId: { type: Number, required: true },
  comments: { type: Array, default: () => [] }
});
const postStore = usePostStore();
const userStore = useUserStore();
const { isLoggedIn, currentUser } = storeToRefs(userStore);
const router = useRouter();

const draft = ref("");
const submit = async () => {
  if (!draft.value.trim() || !currentUser.value) return;
  try {
    const res = await postStore.addComment(props.postId, draft.value, currentUser.value);
    if (!res) {
      ElMessage.warning("评论功能未接入，请连接后端接口");
    } else {
      draft.value = "";
    }
  } catch (err) {
    ElMessage.error(err?.message || "评论失败，请稍后再试");
  }
};

const toLogin = () => router.push({ name: "login", query: { redirect: router.currentRoute.value.fullPath } });
</script>

<style scoped>
.comment-card {
  padding: 16px;
}

.comment-editor {
  margin-bottom: 12px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  display: flex;
  gap: 10px;
}

.name-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.name {
  font-weight: 600;
}

.content {
  margin: 6px 0;
}
</style>

