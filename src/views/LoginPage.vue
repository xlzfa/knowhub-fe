<template>
  <div class="page-wrap auth">
    <div class="card auth-card">
      <div class="title">登录 KnowHub</div>
      <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-button type="primary" round block :loading="loading" @click="submit">登录</el-button>
        <div class="muted" style="margin-top: 12px">
          还没有账号？
          <el-button link type="primary" @click="goRegister">去注册</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="js">
import { reactive, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { useUserStore } from "../stores/user";

const form = reactive({ username: "", password: "" });
const loading = ref(false);
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const formRef = ref();

const rules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }]
};

const submit = () => {
  formRef.value?.validate(async (valid) => {
    if (!valid) return;
    loading.value = true;
    try {
      await userStore.login(form.username, form.password);
      const redirect = route.query.redirect || "/";
      router.push(redirect);
    } catch (err) {
      ElMessage.error(err?.message || "登录功能未接入，请连接后端");
    } finally {
      loading.value = false;
    }
  });
};

const goRegister = () => router.push({ name: "register" });
</script>

<style scoped>
.auth {
  display: flex;
  justify-content: center;
}

.auth-card {
  width: 420px;
  padding: 30px;
  margin-top: 40px;
}

.title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 18px;
}
</style>

