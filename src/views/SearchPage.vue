<template>
  <div class="page-wrap">
    <div class="section-title">搜索结果：{{ keyword || "全部" }}</div>
    <div class="card" style="padding: 16px">
      <div class="space-y-12">
        <PostCard v-for="item in posts" :key="item.id" :post="item" />
      </div>
      <el-empty v-if="!posts.length" description="未找到相关内容" />
    </div>
  </div>
</template>

<script setup lang="js">
import { computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import PostCard from "../components/PostCard.vue";
import { usePostStore } from "../stores/posts";

const route = useRoute();
const postStore = usePostStore();
const { posts } = storeToRefs(postStore);

const keyword = computed(() => route.query.q || "");

const doSearch = () =>
  postStore.search(keyword.value).catch(() =>
    ElMessage.error("搜索功能未接入，请连接后端接口")
  );

onMounted(() => {
  doSearch();
});

watch(keyword, () => doSearch());
</script>

