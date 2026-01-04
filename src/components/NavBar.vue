<template>
  <el-header class="nav">
    <div class="page-wrap nav-inner">
        <div class="brand" @click="goHome">
        <img src="https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f9e0.svg" alt="logo" />
        <span>KnowHub</span>
      </div>
      <el-input
        v-model="keyword"
        placeholder="搜索问题、话题或用户"
        class="nav-search"
        clearable
        @keyup.enter.native="onSearch"
      >
        <template #prepend>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <div class="nav-actions">
        <el-button text @click="goHot">热门</el-button>
        <el-button text @click="goHome">发现</el-button>
        <el-button
          text
          type="primary"
          round
          @click="openAskDialog"
        >
          提问
        </el-button>
        <div v-if="isLoggedIn" class="user-box">
          <el-avatar
            :src="user?.avatar"
            size="small"
            class="clickable-avatar"
            @click="goProfile"
          />
          <!-- <span class="user-name clickable" @click="goProfile">{{ user?.name }}</span> -->
          <el-button link type="primary" @click="logout">退出</el-button>
        </div>
        <div v-else class="user-box">
          <el-button link type="primary" @click="goLogin">登录</el-button>
          <el-button link @click="goRegister">注册</el-button>
        </div>
      </div>
    </div>
  </el-header>

  <!-- 提问弹窗 -->
  <el-dialog
    v-model="askVisible"
    title="发起提问"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form :model="askForm" label-position="top">
      <el-form-item label="问题标题">
        <el-input
          v-model="askForm.title"
          placeholder="写下你的问题标题"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="问题描述">
        <el-input
          v-model="askForm.content"
          type="textarea"
          :rows="6"
          placeholder="详细描述你的问题，清晰的问题更容易获得好答案"
          maxlength="1000"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="askVisible = false">取消</el-button>
      <el-button
        type="primary"
        :loading="submitting"
        @click="submitQuestion"
      >
        发布问题
      </el-button>
    </template>
  </el-dialog>

</template>

<script setup lang="js">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Search } from "@element-plus/icons-vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "../stores/user";
import { ElMessage } from "element-plus";
import request from "@/utils/request"; // 你项目里的封装

const router = useRouter();
const keyword = ref("");
const userStore = useUserStore();
const { isLoggedIn, currentUser: user } = storeToRefs(userStore);

const askVisible = ref(false);
const submitting = ref(false);

const askForm = ref({
  userId: null,
  title: "",
  content: ""
});

const openAskDialog = () => {
  if (!isLoggedIn.value) {
    ElMessage.warning("请先登录再提问");
    router.push({ name: "login" });
    return;
  }
  askVisible.value = true;
};


const submitQuestion = async () => {
  if (!askForm.value.title.trim()) {
    ElMessage.warning("请输入问题标题");
    return;
  }

  submitting.value = true;
  try {
    await request.post("/question/add", {
      userId: user.value.id,
      title: askForm.value.title,
      content: askForm.value.content
    });

    ElMessage.success("提问成功");

    askVisible.value = false;
    askForm.value.title = "";
    askForm.value.content = "";

    // 可选：刷新首页 / 拉取最新问题
    // router.go(0);
  } catch (e) {
    ElMessage.error("提问失败");
  } finally {
    submitting.value = false;
  }
};




const onSearch = () => {
  router.push({ name: "search", query: { q: keyword.value } });
};

const goHome = () => router.push({ name: "home" });
const goHot = () => router.push({ name: "hot" });
// const goCreate = () => router.push({ name: "create-post" });
const goLogin = () => router.push({ name: "login" });
const goRegister = () => router.push({ name: "register" });
const goProfile = () => router.push({ name: "profile" });
const logout = () => {
  userStore.logout();          // 清理状态
  router.push({ name: "home" });  // 跳转到登录页
};
</script>

<style scoped>
.nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  height: 72px;
  background: #fff;
  border-bottom: 1px solid #e6e8f0;
  backdrop-filter: blur(10px);
}

.nav-inner {
  display: flex;
  align-items: center;
  height: 100%;
  gap: 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 20px;
  color: #1f2d3d;
  cursor: pointer;
}

.brand img {
  width: 28px;
  height: 28px;
}

.nav-search {
  flex: 1;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-box {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
}

.user-name {
  font-weight: 500;
}

.clickable-avatar,
.clickable {
  cursor: pointer;
}

.user-name.clickable {
  color: #409eff;
}
</style>

