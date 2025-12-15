<template>
  <el-header class="nav">
    <div class="page-wrap nav-inner">
      <div class="brand" @click="goHome">
        <img src="https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f9e0.svg" alt="logo" />
        <span>KonwHub</span>
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
        <el-button text @click="goCreate" type="primary" round>提问/发帖</el-button>
        <div v-if="isLoggedIn" class="user-box">
          <el-avatar :src="user.avatar || '/images/default-avatar.jpg'" size="small" />
          <span class="user-name">{{ user?.name }}</span>
          <el-button link type="primary" @click="logout">退出</el-button>
        </div>
        <div v-else class="user-box">
          <el-button link type="primary" @click="goLogin">登录</el-button>
          <el-button link @click="goRegister">注册</el-button>
        </div>
      </div>
    </div>
  </el-header>
</template>

<script setup lang="js">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Search } from "@element-plus/icons-vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "../stores/user";

const router = useRouter();
const keyword = ref("");
const userStore = useUserStore();
const { isLoggedIn, currentUser: user } = storeToRefs(userStore);

const onSearch = () => {
  router.push({ name: "search", query: { q: keyword.value } });
};

const goHome = () => router.push({ name: "home" });
const goHot = () => router.push({ name: "hot" });
const goCreate = () => router.push({ name: "create-post" });
const goLogin = () => router.push({ name: "login" });
const goRegister = () => router.push({ name: "register" });
const logout = () => userStore.logout();
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
</style>

