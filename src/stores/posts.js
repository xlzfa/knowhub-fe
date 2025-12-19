import { defineStore } from "pinia";
import { ref } from "vue";
import request from "@/utils/request";

export const usePostStore = defineStore("posts", () => {
  const posts = ref([]);
  const hotPosts = ref([]);
  const loading = ref(false);
  const currentPost = ref(null);
  const postComments = ref({});

  const page = ref(1);
  const pageSize = ref(10);
  const total = ref(0);

  // 加载第一页（或指定页），会替换当前列表
  async function loadPosts(p = 1, ps = 10) {
    loading.value = true;
    console.log("loadPosts called", { p, ps });
    try {
      page.value = p;
      pageSize.value = ps;
      const res = await request.get("/answer/feed", { params: { pageNum: page.value, pageSize: pageSize.value } });
      console.log("loadPosts response", res && res.data);
      const rows = res.data?.data?.rows || [];
      if (page.value === 1) {
        posts.value = rows;
      } else {
        posts.value = posts.value.concat(rows);
      }
      total.value = res.data?.data?.total || rows.length;
      return rows;
    } catch (e) {
      console.error("loadPosts error", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  // 加载下一页并 append；若后端没有更多则不会重复请求
  async function loadMorePosts() {
    if (loading.value) return;
    if (total.value && posts.value.length >= total.value) return;
    loading.value = true;
    try {
      page.value = Math.max(1, page.value + 1);
      console.log("loadMorePosts requesting page", page.value, "pageSize", pageSize.value);
      const res = await request.get("/answer/feed", { params: { pageNum: page.value, pageSize: pageSize.value } });
      console.log("loadMorePosts response", res && res.data);
      const rows = res.data?.data?.rows || [];
      posts.value = posts.value.concat(rows);
      total.value = res.data?.data?.total || total.value;
      console.log("after append posts.length", posts.value.length, "added", rows.length);
    } catch (e) {
      console.error("loadMorePosts error", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function loadHot() {
    // TODO: 调用后端接口获取热门帖子（可按需实现）
    hotPosts.value = [];
  }

  async function search(keyword) {
    loading.value = true;
    try {
      const res = await request.get("/answer/feed", { params: { q: keyword, pageNum: 1, pageSize: 50 } });
      posts.value = res.data?.data?.rows || [];
      total.value = res.data?.data?.total || posts.value.length;
    } catch (e) {
      console.error("search error", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function loadPostDetail(id) {
    // TODO: 根据后端接口调整
    currentPost.value = null;
    postComments.value[id] = [];
  }

  async function likePost(id) {
    // 尝试乐观更新，若后端接口存在可在此处调用
    const target = posts.value.find((p) => p.id === id);
    if (target) target.likeCount = (target.likeCount || 0) + 1;
    if (currentPost.value?.id === id) {
      currentPost.value.likeCount = (currentPost.value.likeCount || 0) + 1;
    }
  }

  async function createPost(payload) {
    console.warn("createPost 未实现，请接入后端接口", payload);
    return null;
  }

  async function addComment(postId, content, user) {
    console.warn("addComment 未实现，请接入后端接口", { postId, content, user });
    return null;
  }

  return {
    posts,
    hotPosts,
    loading,
    currentPost,
    postComments,
    page,
    pageSize,
    total,
    loadPosts,
    loadMorePosts,
    loadHot,
    search,
    loadPostDetail,
    likePost,
    createPost,
    addComment
  };
});

