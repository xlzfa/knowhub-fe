<template>
  <!-- ================= 问题区（100%） ================= -->
  <div class="page-wrap" v-if="question">
    <div class="card detail-card">
      <div class="title-row">
        <div>
          <div class="title">
            {{ question.title || question.questionTitle }}
          </div>
          <div class="muted">
            {{ question.user || "" }} · {{ new Date(question.createTime).toLocaleString() || "" }}
          </div>
        </div>

        <!-- 操作区：写回答 + 点赞 -->
        <div class="question-actions">
          <button class="write-answer-btn" @click="toggleWrite">
            写回答
          </button>

          <LikeButton
            class="zh-like"
            v-model="question.liked"
            :count="question.likeCount || 0"
            @toggle="onLikeQuestion"
          />
        </div>
      </div>

      <div class="content">
        {{ question.content }}
      </div>

      <div class="meta muted">
        浏览 {{ Math.floor((question.hotScore || 0) * 10) }}
        · 回答 {{ answers.length }}
      </div>
    </div>

    <!-- 写回答编辑区 -->
    <div v-if="showWrite" class="card write-card">
      <CreatePost
        :questionId="question.id"
        @success="onPostSuccess"
      />
    </div>
  </div>

  <!-- ================= 回答区 ================= -->
  <div class="page-wrap answers-wrap" v-if="question">
    <div class="answers-layout">
      <!-- 左：回答列表 -->
      <div class="main">
        <div class="card answers-card answers-header">
          <div class="section-title">
            回答 · {{ answers.length }}
          </div>
        </div>

        <div class="card answers-card">
          <div v-for="ans in answers" :key="ans.id" class="answer-item">
            <div class="answer-inner zh-answer">
              <div class="answer-header">
                <strong>{{ ans.user || "匿名" }}</strong>
              </div>

          

              <MdPreview
              class="answer-body"
              :modelValue="ans.content" />

              <div class="answer-time muted">
                编辑于 {{ new Date(ans.createTime).toLocaleString() }}
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
                  · {{ postComments[ans.id + "_total"] || (postComments[ans.id] || []).length }}
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

      <!-- 右：侧栏 -->
      <div class="side">
        <SidebarHot />
      </div>
    </div>
  </div>

  <div class="page-wrap" v-else>
    <el-empty description="帖子不存在或已删除" />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'


import LikeButton from "../components/LikeButton.vue";
import SidebarHot from "../components/SidebarHot.vue";
import CreatePost from "../components/CreatePost.vue";
import CommentList from "../components/CommentList.vue";
import { usePostStore } from "../stores/posts";

const props = defineProps({ id: [String, Number] });
const route = useRoute();
const postStore = usePostStore();

const { currentPost: post, postComments } = storeToRefs(postStore);

const postId = computed(() => Number(route.params.id || props.id));
const question = post;

const answers = computed(() => {
  if (!question.value) return [];
  return question.value.rows || [];
});

const showComments = reactive({});
const likedMap = reactive({});
const showWrite = ref(false);

/* 展开/收起写回答 */
const toggleWrite = () => {
  showWrite.value = !showWrite.value;
};

/* 写回答成功 */
const onPostSuccess = () => {
  showWrite.value = false;
  postStore.loadPostDetail(postId.value);
};

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
  postStore.likePost(question.value.id, question.value.liked).catch(() => {
    question.value.liked = !question.value.liked;
  });
};

onMounted(async () => {

  // console.log("[DEBUG] route.params.id =", route.params.id);
  // console.log("[DEBUG] props.id =", props.id);
  // console.log("[DEBUG] postId.value =", postId.value);
  try {
    await postStore.loadPostDetail(postId.value);
  } catch {
    ElMessage.error("获取帖子详情失败");
  }
});
</script>

<style scoped>
.page-wrap {
  max-width: 1100px;
  margin: 0 auto 18px;
}

.detail-card {
  padding: 24px 28px;
}

.title-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.question-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.write-answer-btn {
  height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid #175199;
  background: #e6f0ff;
  color: #175199;
  font-size: 13px;
  cursor: pointer;
}

.write-answer-btn:hover {
  background: #dbe9ff;
}

.write-card {
  margin-top: 12px;
  padding: 16px 20px;
}

.answers-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 18px;
}

.answers-card {
  padding: 16px 28px;
}

.answers-header {
  padding-bottom: 8px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
}

.answer-item {
  border-bottom: 1px solid #f0f2f7;
}

.answer-inner {
  padding: 16px 0;
}

.answer-actions {
  display: flex;
  gap: 14px;
  margin-top: 8px;
}


/* ================= 评论按钮（知乎风格） ================= */
button.comment-btn.zhihu {
  background: none;
  border: none;
  padding: 0;
  font-size: 13px;
  color: #8590a6;
  cursor: pointer;
  line-height: 1;
}

button.comment-btn.zhihu:hover {
  color: #175199;
}


@media (max-width: 960px) {
  .answers-layout {
    grid-template-columns: 1fr;
  }
}
</style>
