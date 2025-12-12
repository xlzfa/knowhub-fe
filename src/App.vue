<template>
  <el-container class="app-shell" direction="vertical">
    <NavBar />
    <el-main class="app-main">
      <RouterView />
    </el-main>
    <FooterBar />
  </el-container>
</template>

<script setup lang="js">
import { RouterView } from "vue-router";
import NavBar from "./components/NavBar.vue";
import FooterBar from "./components/FooterBar.vue";
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: #f6f7fb;
  display: flex;
  flex-direction: column;
}

.app-main {
  padding: 90px 0 40px;
  flex: 1;
}
</style>

