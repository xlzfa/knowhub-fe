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
import request from "@/utils/request";
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { storeToRefs } from "pinia";
import { useUserStore } from "../stores/user";
const { currentUser: user } = storeToRefs(useUserStore());

const router = useRouter();
const userStore = useUserStore();

const formRef = ref();
const saving = ref(false);

const form = reactive({
      avatar: user.value?.avatar || "", // 存 OSS URL
      name: user.value?.name || "",
      email: user.value?.email || "",
      bio: user.value?.bio || ""
    });

    const fileInput = ref(null);
    const preview = ref("");

    const chooseFile = () => fileInput.value?.click();

    const onFileChange = async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  //本地预览（给人看）
  preview.value = URL.createObjectURL(file);

  //上传 OSS
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await request.post(
      "/upload/avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );

    //保存 OSS URL（给后端）
    form.avatar = res.data.data;

  } catch (err) {
    ElMessage.error("头像上传失败");
  }
};


    const cancel = () => router.push({ name: "profile" });

    const save = async () => {
    formRef.value?.validate?.(() => {});
    saving.value = true;
    try {


    const payload = {
        id: user.value.id, 
        avatar: form.avatar,
        username: form.name,
        email: form.email,
        bio: form.bio
    };

    // console.log("current", user);

        const res = await request.post("/user/update", payload);

        const updatedUser = res.data.data;

        user.value = {
          id: updatedUser.id,
          name: updatedUser.username,
          avatar: updatedUser.avatar || "/src/images/default-avatar.jpg",
          email: updatedUser.email,
          bio: updatedUser.bio
        };
        
        try {
          localStorage.setItem("user", JSON.stringify(updatedUser));
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
