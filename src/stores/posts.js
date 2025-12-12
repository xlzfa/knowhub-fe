import { defineStore } from "pinia";
import { ref } from "vue";

export const usePostStore = defineStore("posts", () => {
  const posts = ref([]);
  const hotPosts = ref([]);
  const loading = ref(false);
  const currentPost = ref(null);
  const postComments = ref({});

  async function loadPosts() {
    loading.value = true;
    // TODO: 调用后端接口获取帖子列表
    posts.value = [];
    loading.value = false;
  }

  async function loadHot() {
    // TODO: 调用后端接口获取热门帖子
    hotPosts.value = [];
  }

  async function search(keyword) {
    loading.value = true;
    // TODO: 调用后端搜索接口
    posts.value = [];
    loading.value = false;
  }

  async function loadPostDetail(id) {
    // TODO: 调用后端接口获取帖子详情与评论
    currentPost.value = null;
    postComments.value[id] = [];
  }

  async function likePost(id) {
    // TODO: 调用后端点赞接口
    const target = posts.value.find((p) => p.id === id);
    if (target) target.likes = (target.likes || 0) + 1;
    if (currentPost.value?.id === id) {
      currentPost.value.likes = (currentPost.value.likes || 0) + 1;
    }
  }

  async function createPost(payload) {
    // TODO: 调用后端发帖接口，返回新建帖子
    console.warn("createPost 未实现，请接入后端接口", payload);
    return null;
  }

  async function addComment(postId, content, user) {
    // TODO: 调用后端评论接口
    console.warn("addComment 未实现，请接入后端接口", { postId, content, user });
    return null;
  }

  return {
    posts,
    hotPosts,
    loading,
    currentPost,
    postComments,
    loadPosts,
    loadHot,
    search,
    loadPostDetail,
    likePost,
    createPost,
    addComment
  };
});

