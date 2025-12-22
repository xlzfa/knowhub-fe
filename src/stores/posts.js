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

  async function likePost(id, shouldLike = true) {
    console.log("store.likePost called", { id, shouldLike });
    // 支持切换：shouldLike = true 表示点赞，false 表示取消赞
    const target = posts.value.find((p) => p.id === id);
    const prev = target ? { likeCount: target.likeCount || 0, liked: Boolean(target.liked) } : null;
    const curPrev = currentPost.value?.id === id ? { likeCount: currentPost.value.likeCount || 0, liked: Boolean(currentPost.value.liked) } : null;

    // 乐观更新
    if (target) {
      if (shouldLike && !prev.liked) {
        target.likeCount = prev.likeCount + 1;
        target.liked = true;
      } else if (!shouldLike && prev.liked) {
        target.likeCount = Math.max(0, prev.likeCount - 1);
        target.liked = false;
      }
    }
    if (curPrev) {
      if (shouldLike && !curPrev.liked) {
        currentPost.value.likeCount = curPrev.likeCount + 1;
        currentPost.value.liked = true;
      } else if (!shouldLike && curPrev.liked) {
        currentPost.value.likeCount = Math.max(0, curPrev.likeCount - 1);
        currentPost.value.liked = false;
      }
    }

    try {
      const res = await request.post("/answer/like", { id, like: !!shouldLike });
      console.log("store.likePost response", res && res.data);
    } catch (e) {
      console.error("likePost sync failed", e);
      // 回滚
      if (target && prev) {
        target.likeCount = prev.likeCount;
        target.liked = prev.liked;
      }
      if (curPrev) {
        currentPost.value.likeCount = curPrev.likeCount;
        currentPost.value.liked = curPrev.liked;
      }
      throw e;
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

