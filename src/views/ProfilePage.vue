<template>
  <div class="page-wrap layout">
    <div class="main">
      <!-- 用户信息：完全不动 -->
      <div class="card profile-card">
        <div class="user-row">
          <div class="user-info">
            <el-avatar :src="user?.avatar" size="large" />
            <div>
              <div class="name">{{ user?.name }}</div>
            </div>
          </div>
          <div class="profile-actions">
            <el-button type="primary" plain @click="goEditProfile">
              编辑资料
            </el-button>
          </div>
        </div>
        <div class="muted" style="margin-top: 8px">
          {{ user?.bio || "欢迎来到 KnowHub，一起交流知识。" }}
        </div>
      </div>


      <div class="card list-card">
      <!-- 横栏 -->
      <div class="profile-tabs">
        <div
          class="tab"
          :class="{ active: activeTab === 'question' }"
          @click="activeTab = 'question'"
        >
          我的提问
        </div>
        <div
          class="tab"
          :class="{ active: activeTab === 'answer' }"
          @click="activeTab = 'answer'"
        >
          我的回答
        </div>
        <div
          class="tab"
          :class="{ active: activeTab === 'comment' }"
          @click="activeTab = 'comment'"
        >
          我的评论
        </div>
      </div>

      <!-- Question -->
      <div v-if="activeTab === 'question'">
        <div v-if="myQuestions && myQuestions.length" class="space-y-12">
          <div v-for="item in myQuestions" :key="item.id" class="qa-item">
            <div
              class="qa-title clickable"
              @click="goQuestionDetail(item.id)"
            >
              {{ item.title }}
            </div>
            <div class="muted">{{ item.createdTime }}</div>
          </div>
        </div>
        <el-empty v-else description="还没有提问" />
      </div>

      <!-- Answer -->
      <div v-else-if="activeTab === 'answer'">
        <div v-if="myAnswers && myAnswers.length">
          <PostCard
            v-for="item in myAnswers"
            :key="item.id"
            :post="item"
            :show-like="false"
            :show-comment="false"
          />
        </div>
        <el-empty v-else description="还没有回答" />
      </div>


      <!-- Comment -->
      <div v-else>
        <div v-if="myComments && myComments.length">
          <div
            v-for="item in myComments"
            :key="item.id"
            class="comment-item"
          >
            <div class="comment-meta">
              
              <span
                class="qa-title clickable"
                @click="goToMyComment(item)"
              >
                &nbsp;&nbsp;{{ item.questionTitle }}&nbsp;&nbsp;
            </span>
              中
              &nbsp;&nbsp;&nbsp;{{ item.answerUsername }} &nbsp;&nbsp;&nbsp;的回答
              {{ item.createTime }}
            </div>

            <br>

            <div class="content">
              &nbsp;&nbsp;&nbsp;&nbsp;{{ item.content }}
            </div>
          </div>

        </div>
        <el-empty v-else description="还没有评论" />
      </div>
    </div>

  </div>


    <!-- 侧边栏：不动 -->
    <div class="side">
      <SidebarHot />
    </div>
  </div>
</template>



<script setup lang="js">
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";

import SidebarHot from "../components/SidebarHot.vue";
import { useUserStore } from "../stores/user";
import { usePostStore } from "../stores/posts";

import PostCard from "../components/PostCard.vue";


const { currentUser: user } = storeToRefs(useUserStore());

const contentStore = usePostStore();
const { myQuestions, myAnswers, myComments } =
  storeToRefs(contentStore);

const router = useRouter();
const activeTab = ref("question");

const goEditProfile = () => {
  router.push({ name: "profile-edit" });
};

const goQuestionDetail = (id) => {
  router.push({
    name: "post-detail",
    params: { id }
  });
};

const goToMyComment = (item) => {
  router.push({
    name: "post-detail",
    params: { id: item.questionId },
    query: {
      answerId: item.answerId,
      commentId: item.id
    }
  });
};



watch(
  () => user.value,
  (u) => {
    if (!u || !u.id) return;

    console.log("ProfilePage user ready:", u.id);

    contentStore.loadMyQuestions(u.id);
    contentStore.loadMyAnswers(u.id);
    contentStore.loadMyComments(u.id);
  },
  { immediate: true }
);
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

.profile-tabs {
  display: flex;
  gap: 24px;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 16px;
}

.profile-tabs .tab {
  padding: 8px 0;
  font-size: 15px;
  color: #606266;
  cursor: pointer;
  position: relative;
}

.profile-tabs .tab.active {
  color: #409eff;
  font-weight: 600;
}

.profile-tabs .tab.active::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -1px;
  width: 100%;
  height: 2px;
  background-color: #409eff;
}

.qa-item {
  padding: 8px 0;
  border-bottom: 1px solid #f1f2f6;
}

.qa-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}

.qa-title.clickable {
  cursor: pointer;
  color: #303133;
}

.qa-title.clickable:hover {
  color: #409eff;
  text-decoration: underline;
}



</style>

