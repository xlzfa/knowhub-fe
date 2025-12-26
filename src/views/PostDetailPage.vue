<template>
  <!-- 问题区 -->
  <div class="page-wrap layout">
    <div class="main card detail-card" v-if="question">
      <div class="title-row">
        <div>
          <div class="title">
            {{ question.title || question.questionTitle || question.quertionTitle }}
          </div>
          <div class="muted">
            {{ question.author?.name || '' }}
            · {{ question.createdAt || question.createTime || '' }}
            · {{ (question.tags || []).join(" / ") }}
          </div>
        </div>
        <LikeButton
          class="zh-like"
          v-model="question.liked"
          :count="question.likeCount || 0"
          @toggle="onLikeQuestion"
        />

      </div>

      <div class="content">
        {{ question.content || question.summary }}
      </div>

      <div class="meta muted">
        浏览 {{ Math.floor((question.hotScore || 0) * 10) }} · 回答 {{ answers.length }}
      </div>
    </div>

    <div class="side">
      <SidebarHot />
    </div>
  </div>

  <!-- 回答区 -->
  <div class="page-wrap layout" v-if="question">
    <div class="main">
      <div class="card answers-card">
        <div class="section-title">回答 · {{ answers.length }}</div>

        <div class="answers-list">
          <div
            v-for="ans in answers"
            :key="ans.id"
            class="answer-item"
          >
            <div class="answer-inner zh-answer">
              <div class="answer-header">
                <strong>{{ ans.user || ans.author || "匿名" }}</strong>
              </div>

              <div class="answer-body">
                {{ ans.content }}
              </div>

              <div class="answer-time muted">
                编辑于 {{ new Date(ans.createTime || ans.createdAt || "").toLocaleString() }}
              </div>

              <div class="answer-actions zhihu">
                <LikeButton
                  class="zh-like"
                  v-model="likedMap[ans.id]"
                  :count="ans.likeCount || 0"
                  @toggle="() => onToggleAnswer(ans)"
                />
                <button
                  class="comment-btn zhihu"
                  @click.prevent="toggleComments(ans.id)"
                >
                  {{ showComments[ans.id] ? "隐藏评论" : "评论" }}
                  · {{ (postComments[ans.id] || []).length }}
                </button>
              </div>

              <CommentList
                v-if="showComments[ans.id]"
                :post-id="ans.id"
                :comments="postComments[ans.id] || []"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="side"></div>
  </div>

  <div class="page-wrap" v-else>
    <el-empty description="帖子不存在或已删除" />
  </div>
</template>

<script setup lang="js">
import { computed, onMounted, reactive, watch } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";

import LikeButton from "../components/LikeButton.vue";
import SidebarHot from "../components/SidebarHot.vue";
import CommentList from "../components/CommentList.vue";
import { usePostStore } from "../stores/posts";

const props = defineProps({ id: [String, Number] });
const route = useRoute();
const postStore = usePostStore();

const { currentPost: post, postComments } = storeToRefs(postStore);

const postId = computed(() => Number(route.params.id || props.id));

// const question = computed(() => {
//   if (post.value) return post.value;
//   return postStore.posts.find((p) => p.id === postId.value) || null;
// });

const question = post;


const answers = computed(() => {
  if (!question.value) return [];
  if (question.value.rows) return question.value.rows;
  return postStore.posts.filter(
    (p) => p.questionId === question.value.id
  );
});

const showComments = reactive({});
const likedMap = reactive({});

watch(
  answers,
  (arr) => {
    arr.forEach((a) => {
      if (likedMap[a.id] === undefined) {
        likedMap[a.id] = Boolean(a.liked);
      }
    });
  },
  { immediate: true }
);

const toggleComments = (id) => {
  showComments[id] = !showComments[id];
  if (showComments[id] && !postComments.value[id]) {
    postComments.value[id] = [];
  }
};

const onToggleAnswer = async (ans) => {
  try {
    await postStore.likePost(ans.id, likedMap[ans.id]);
  } catch {
    likedMap[ans.id] = !likedMap[ans.id];
  }
};

const onLikeQuestion = () => {
  if (!question.value) return;

  if(questionLiked.value == false && (question.value.likeCount || 0) >0){
    question.value.likeCount -=1;
  }else if(questionLiked.value == true){
    question.value.likeCount = (question.value.likeCount || 0) +1;
  }
  
  postStore.likePost(question.value.id,questionLiked.value).catch(() => {
      questionLiked.value = !questionLiked.value;
    });

  
};

const questionLiked = computed({
  get() {
    return Boolean(question.value?.liked);
  },
  set(val) {
    if (question.value) {
      question.value.liked = val;
    }
  }
});


onMounted(async () => {
  try {
    await postStore.loadPostDetail(postId.value);
  } catch {
    ElMessage.error("获取帖子详情失败");
  }
});
</script>

<style scoped>
/* ===== layout ===== */
.layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 18px;
}

@media (max-width: 960px) {
  .layout {
    grid-template-columns: 1fr;
  }
}

/* ===== question ===== */
.detail-card {
  padding: 24px 28px;
}

.title-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.title {
  font-size: 22px;
  font-weight: 700;
  color: #121212;
}

.muted {
  font-size: 13px;
  color: #8590a6;
}

.content {
  margin: 18px 0;
  font-size: 15px;
  line-height: 1.8;
  color: #1a1a1a;
}

/* ===== answers ===== */
.answers-card {
  padding: 20px 28px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.answer-item {
  border-bottom: 1px solid #f0f2f7;
}

.answer-inner.zh-answer {
  padding: 16px 0;
}

.answer-header strong {
  font-size: 14px;
  color: #121212;
}

.answer-body {
  margin-top: 8px;
  font-size: 15px;
  line-height: 1.7;
  color: #1a1a1a;
}

.answer-time {
  margin-top: 6px;
  font-size: 12px;
  color: #8590a6;
}

/* ===== zhihu actions ===== */
.answer-actions.zhihu {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 8px;
  font-size: 13px;
}

.zh-like {
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  background: #f6f6f6;
  border: 1px solid #ebebeb;
  color: #8590a6;
}

.zh-like:hover {
  background: #e6f0ff;
  border-color: #b3d5ff;
  color: #175199;
}

.comment-btn.zhihu {
  background: none;
  border: none;
  padding: 0;
  font-size: 13px;
  color: #8590a6;
  cursor: pointer;
}

.comment-btn.zhihu:hover {
  color: #175199;
}
</style>
