<template>
  <div class="page-wrap">
    <div class="card form-card">
      <div class="section-title">编辑资料</div>
      <el-form :model="form" label-position="top" ref="formRef">
        <div class="edit-layout">
          <div class="avatar-column">
            <div class="avatar-edit">
              <el-avatar :src="preview || user?.avatar || '/images/default-avatar.jpg'" :size="160" class="clickable big-avatar" @click="chooseFile" />
              <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileChange" />
            </div>
          </div>
          <div class="fields-column">
            <el-form-item label="用户名">
              <el-input v-model="form.name" :placeholder="user?.name || '用户名'" />
            </el-form-item>
            <el-form-item label="电子邮箱">
              <el-input v-model="form.email" :placeholder="user?.email || '留个邮箱吧～'" />
            </el-form-item>
            <el-form-item label="个性签名">
              <el-input v-model="form.bio" type="textarea" :rows="4" :placeholder="user?.bio || '说点什么吧～'" />
            </el-form-item>
          </div>
        </div>
        <div class="flex-between action-row">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="save" :loading="saving">保存</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="js">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import { useUserStore } from "../stores/user";
const { currentUser: user } = storeToRefs(useUserStore());

const router = useRouter();
const userStore = useUserStore();
const { currentUser } = storeToRefs(userStore);

const formRef = ref();
const saving = ref(false);

const form = reactive({
  avatar: currentUser.value?.avatar || "",
  name: "",
  email: "",
  bio: ""
});

const fileInput = ref(null);
const preview = ref("");

const chooseFile = () => fileInput.value?.click();

const onFileChange = (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    preview.value = ev.target.result;
    form.avatar = preview.value; // 使用 base64 作为临时头像
  };
  reader.readAsDataURL(file);
};

const cancel = () => router.push({ name: "profile" });

const save = async () => {
  formRef.value?.validate?.(() => {});
  saving.value = true;
  try {
    // TODO: 调用后端更新接口：PUT /api/user/profile
    // 临时在前端更新 store（如需持久化请接入后端）
    if (currentUser.value) {
      currentUser.value.avatar = form.avatar || currentUser.value.avatar;
      currentUser.value.name = form.name || currentUser.value.name;
      currentUser.value.email = form.email || currentUser.value.email;
      currentUser.value.bio = form.bio || currentUser.value.bio;
    }
    // 持久化到 localStorage，保证刷新后保留头像和资料
    try {
      localStorage.setItem("user", JSON.stringify(currentUser.value));
    } catch (e) {
      console.warn("保存用户到 localStorage 失败", e);
    }
    ElMessage.success("保存成功");
    router.push({ name: "profile" });
  } catch (err) {
    ElMessage.error(err?.message || "保存失败");
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.form-card {
  padding: 20px;
}
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}
.avatar-edit {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.avatar-edit .clickable {
  cursor: pointer;
}

.edit-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}
.avatar-column {
  width: 240px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}
.big-avatar {
  border-radius: 8px;
}
.fields-column {
  flex: 1;
}
.action-row {
  margin-top: 20px;
}
</style>
