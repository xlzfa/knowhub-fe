<template>
  <div class="page-wrap">
    <div class="card form-card">
      <div class="section-title">发布新帖</div>
      <el-form :model="form" label-position="top" :rules="rules" ref="formRef">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" maxlength="80" show-word-limit placeholder="一句话说清主题" />
        </el-form-item>
        <el-form-item label="正文" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="8"
            placeholder="详细描述你的问题或分享"
          />
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-select v-model="form.tags" multiple filterable allow-create default-first-option placeholder="选择或输入标签">
            <el-option v-for="tag in presetTags" :key="tag" :value="tag" :label="tag" />
          </el-select>
        </el-form-item>
        <div class="flex-between">
          <span class="muted">发布后可在个人中心管理</span>
          <el-button type="primary" round :loading="loading" @click="submit">发布</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="js">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import { usePostStore } from "../stores/posts";
import { useUserStore } from "../stores/user";

const form = reactive({ title: "", content: "", tags: [] });
const rules = {
  title: [{ required: true, message: "请输入标题", trigger: "blur" }],
  content: [{ required: true, message: "请输入正文", trigger: "blur" }],
  tags: [{ type: "array", required: true, message: "请至少选择一个标签", trigger: "change" }]
};

const presetTags = ["前端", "后端", "AI", "产品", "设计", "Vue", "经验分享"];
const loading = ref(false);
const formRef = ref();
const postStore = usePostStore();
const router = useRouter();
const { currentUser } = storeToRefs(useUserStore());

const submit = () => {
  formRef.value?.validate(async (valid) => {
    if (!valid || !currentUser.value) return;
    loading.value = true;
    try {
      const post = await postStore.createPost({
        title: form.title,
        content: form.content,
        tags: form.tags,
        author: currentUser.value
      });
      if (post?.id) {
        router.push({ name: "post-detail", params: { id: post.id } });
      } else {
        ElMessage.warning("发帖功能未接入，请连接后端接口");
      }
    } catch (err) {
      ElMessage.error(err?.message || "发帖失败，请稍后再试");
    } finally {
      loading.value = false;
    }
  });
};
</script>

<style scoped>
.form-card {
  padding: 20px;
}
</style>

