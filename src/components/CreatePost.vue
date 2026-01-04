<template>
  <div class="page-wrap">
    <div class="card form-card">
      <div class="section-title">回答问题</div>

      <el-form
        :model="form"
        label-position="top"
        :rules="rules"
        ref="formRef"
      >
        <!--
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="form.title"
            maxlength="80"
            show-word-limit
            placeholder="一句话说清主题"
          />
        </el-form-item>
        
        -->
        

        <!-- 正文（Markdown 编辑器） -->
        <el-form-item label="正文" prop="content">
          <MdEditor
            v-model="form.content"
            :preview="true"
            :toolbarsExclude="['save']"
            :onUploadImg="onUploadImg"
            style="height: 420px"
            placeholder="详细描述你的问题，支持 Markdown"
          />
        </el-form-item>

        <!-- 标签 -->
        <!-- <el-form-item label="标签" prop="tags">
          <el-select
            v-model="form.tags"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="选择或输入标签"
          >
            <el-option
              v-for="tag in presetTags"
              :key="tag"
              :value="tag"
              :label="tag"
            />
          </el-select>
        </el-form-item> -->

        <div class="flex-between">
          <span class="muted">发布后可在个人中心管理</span>
          <el-button
            type="primary"
            round
            :loading="loading"
            @click="submit"
          >
            发布
          </el-button>
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

import request from "@/utils/request";

import { MdEditor } from "md-editor-v3";
import "md-editor-v3/lib/style.css";


const props = defineProps({
  questionId: {
    type: Number,
    required: true
  }
});


const form = reactive({
  title: "",
  content: "",
  tags: []
});

const rules = {
  // title: [{ required: true, message: "请输入标题", trigger: "blur" }],
  content: [{ required: true, message: "请输入正文", trigger: "blur" }],
  // tags: [
  //   { type: "array", required: true, message: "请至少选择一个标签", trigger: "change" }
  // ]
};

// const presetTags = ["前端", "后端", "AI", "产品", "设计", "Vue", "经验分享"];

const loading = ref(false);
const formRef = ref();
const postStore = usePostStore();
const router = useRouter();
const { currentUser } = storeToRefs(useUserStore());
const emit = defineEmits(["success"]);


const submit = () => {
  formRef.value?.validate(async (valid) => {
    if (!valid || !currentUser.value) return;

    loading.value = true;
    try {
      const post = await postStore.createPost({
        questionId: props.questionId,
        content: form.content, // 👈 Markdown 原文
        // tags: form.tags,
        userId: currentUser.value.id
      });

        router.push({ name: "post-detail", params: { id: props.questionId } });
      ElMessage.success("回答已发布");
      emit("success");
    } catch (err) {
      ElMessage.error(err?.message || "发帖失败，请稍后再试");
    }
  });
};



const onUploadImg = async (files, callback) => {
  const urls = [];

  try {
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await request.post(
        "/upload/answer",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      const url = res.data?.data;
      if (!url) throw new Error("未返回图片地址");

      urls.push(url);
    }

    callback(urls);
  } catch (e) {
    console.error(e);
    ElMessage.error("图片上传失败");
  }
};




</script>

<style scoped>
.form-card {
  padding: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.md-editor {
  border-radius: 6px;
}
</style>
