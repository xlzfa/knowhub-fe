import { defineStore } from "pinia";
import { ref } from "vue";
import request from "@/utils/request";

export const usePostStore = defineStore("posts", () => {
  const posts = ref([]);
  const hotPosts = ref([]);
  const loading = ref(false);
  const currentPost = ref(null);
  const postComments = ref({});

  const myQuestions = ref([]); 
  const myAnswers = ref([]);  
  const myComments = ref([]);

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
  currentPost.value = null;

  try {
    const res = await request.get("/question/detail", {
      params: { id, pageNum: 1, pageSize: 10 }
    });

    const data = res?.data?.data;
    if (!data) {
      currentPost.value = null;
      return null;
    }

    /* question */
    const question = data.question;
    if (!question) {
      currentPost.value = null;
      return null;
    }

    /* answers */
    const answers = data.answers?.rows || [];

    /**
     * 把 answers 挂到 question 上
     * 页面只认 question + question.rows
     */
    question.rows = answers;

    /* comments：按 answerId 整理 */
    answers.forEach((ans) => {
      const commentRows = ans.comments?.rows || [];
      postComments.value[ans.id] = commentRows;
      postComments.value[ans.id + "_total"] = ans.comments?.total || commentRows.length;
    });

    /* 设置当前问题 */
    currentPost.value = question;

    return question;
  } catch (err) {
    console.error("loadPostDetail error", err);
    throw err;
  }
}


  async function likePost({ id, type, like }) {
    const res = await request.post(
        type === "answer" ? "/answer/like" : "/question/like",
        { id, like }
    );

    const data = res?.data?.data;
    if (!data) return res;

    /* ===== 更新 feed 列表里的 answer ===== */
    if (type === "answer") {
      // 1️⃣ 首页 feed（posts）
      const target = posts.value.find(p => p.id === id);
      if (target) {
        target.liked = data.liked;
        target.likeCount = data.likeCount;
      }

      // 2️⃣ 详情页 answers（currentPost.rows）
      if (currentPost.value?.rows) {
        const ans = currentPost.value.rows.find(a => a.id === id);
        if (ans) {
          ans.liked = data.liked;
          ans.likeCount = data.likeCount;
        }
      }
    }

    /* ===== 更新问题点赞 ===== */
    if (type === "question") {
      if (currentPost.value?.id === id) {
        currentPost.value.liked = data.liked;
        currentPost.value.likeCount = data.likeCount;
      }
    }

    return res;
  }












  async function createPost(payload) {
    try {
      await request.post("/answer/add", payload);
    
    } catch (e) {
      console.error("回答失败", e);
      throw e;
    }



  }

  async function addComment({ userId, answerId, parentId = null, content }) {
  if (!content) return null;

  try {
    const payload = {
      userId,
      answerId,
      parentId,
      content,
    };

    const res = await request.post("/comment/add", payload).catch(() => null);

    return res;

  } catch (e) {
    console.error("addComment failed", e);
    throw e;
  }
}

  async function getCommentList({answerId}) {
    try {
      const res = await request.get(`/comment/list/${answerId}`);

      return res?.data?.data;
    } catch (e) {
      console.error("CommentList failed", e);
      throw e;
    }
  } 

  async function loadMyQuestions(userId) {
    try {
      console.log("loadMyQuestions called, userId =", userId);
      myQuestions.value = [];

      const res = await request.get("/question/mine", {
        params: { userId }
      });
      console.log("question mine res =", res?.data);

      myQuestions.value = res?.data?.data || [];

    } catch (err) {
      console.error("loadMyQuestions error", err);
    }
  }


  async function loadMyAnswers(userId) {
    try {
      myAnswers.value = [];

      const res = await request.get("/answer/mine", {
        params: { userId }
      });

      myAnswers.value = res?.data?.data || [];
    } catch (err) {
      console.error("loadMyAnswers error", err);
    }
  }


  async function loadMyComments(userId) {
    try {
      myComments.value = [];

      const res = await request.get("/comment/mine", {
        params: { userId }
      });

      myComments.value = res?.data?.data || [];
    } catch (err) {
      console.error("loadMyComments error", err);
    }
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
    myQuestions,
    myAnswers,
    myComments,
    loadMyQuestions,
    loadMyAnswers,
    loadMyComments,
    loadPosts,
    loadMorePosts,
    loadHot,
    search,
    loadPostDetail,
    likePost,
    createPost,
    addComment,
    getCommentList,
  };
});

