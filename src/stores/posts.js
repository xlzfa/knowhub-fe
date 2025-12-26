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
    // 使用后端提供的 question/detail 接口
    currentPost.value = null;
    postComments.value[id] = [];
    try {
      const res = await request.get("/question/detail", { params: { pageNum: 1, id, pageSize: 10 } });
      console.log("loadPostDetail /question/detail response", res && res.data);
      const payload = res?.data?.data || res?.data || null;
      if (!payload) {
        currentPost.value = null;
        return null;
      }

      // 常见返回形式： { question: {...}, answers: [...], comments: [...] }
      // 但也兼容后端直接返回 { rows: [...] } 的情况（rows 中可能第一项是 question，其余是 answers）
      let questionData = null;
      let normalizedAnswers = [];
      if (payload.question) {
        questionData = payload.question;
        // 支持 answers 为对象（带 rows/total）或直接为数组
        normalizedAnswers = payload.answers?.rows || payload.answers || payload.answerList || payload.answersList || payload.rows || [];
      } else if (Array.isArray(payload.rows)) {
        const rows = payload.rows;
        // 后端仅返回 answers 列表（每项带有 questionId），尝试单独拉取 question 详情
        normalizedAnswers = rows;
        // 尝试若干可能的 question 接口
        let qdata = null;
        try {
          const qres1 = await request.get(`/question/${id}`).catch(() => null);
          qdata = qres1?.data?.data || qres1?.data || null;
        } catch (e) {
          qdata = null;
        }
        if (!qdata) {
          try {
            const qres2 = await request.get(`/question/get`, { params: { id } }).catch(() => null);
            qdata = qres2?.data?.data || qres2?.data || null;
          } catch (e) {
            qdata = null;
          }
        }
        if (!qdata) {
          try {
            const qres3 = await request.get(`/question/info`, { params: { id } }).catch(() => null);
            qdata = qres3?.data?.data || qres3?.data || null;
          } catch (e) {
            qdata = null;
          }
        }
        if (!qdata) {
          // 回退：用 rows 中的 questionId 和可能的 quertionTitle/questionTitle 构建占位 question
          const sample = rows[0];
          qdata = {
            id: sample?.questionId || id,
            title: sample?.quertionTitle || sample?.questionTitle || `问题 ${sample?.questionId || id}`,
            content: sample?.questionContent || sample?.content || "",
            author: sample?.questionAuthor || null
          };
        }
        questionData = qdata;
      } else {
        // 回退：把 payload 本身当作 question
        questionData = payload;
        normalizedAnswers = payload.answers || payload.rows || [];
      }

      // 将解析得到的 answers 附到 questionData，便于视图直接使用原始答案列表
      try {
        // 不破坏原对象引用，优先添加 __answers 字段
        if (questionData && !Object.prototype.hasOwnProperty.call(questionData, "__answers")) {
          questionData.__answers = normalizedAnswers;
        } else if (questionData) {
          questionData.__answers = normalizedAnswers;
        }
      } catch (e) {
        // ignore
      }
      currentPost.value = questionData;

      // 合并到 posts
      const existIds = new Set(posts.value.map((p) => p.id));
      normalizedAnswers.forEach((a) => {
        if (!existIds.has(a.id)) posts.value.push(a);
      });

      // 解析 comments：可能为 map 或数组
      const commentsPayload = payload.comments || payload.commentList || payload.commentsList || [];
      // 如果是数组，按 answerId/parentId 分组
      if (Array.isArray(commentsPayload)) {
        for (const c of commentsPayload) {
          const targetId = c.answerId || c.postId || c.questionId || c.parentId || questionData.id;
          postComments.value[targetId] = postComments.value[targetId] || [];
          postComments.value[targetId].push(c);
        }
      } else if (commentsPayload && typeof commentsPayload === "object") {
        // 预期为 { answerId: [..], questionId: [..] }
        for (const key of Object.keys(commentsPayload)) {
          const k = Number(key);
          postComments.value[k] = commentsPayload[key] || [];
        }
      }

      // 确保每个 answer 都有空数组（若后端没有评论数据）
      normalizedAnswers.forEach((a) => {
        postComments.value[a.id] = postComments.value[a.id] || [];
      });

      // 确保 question 自身的评论初始化
      const qid = questionData.id || id;
      postComments.value[qid] = postComments.value[qid] || [];

      return questionData;
    } catch (e) {
      console.error("loadPostDetail error", e);
      throw e;
    }
  }

async function likePost(id, shouldLike = true) {
  console.log("store.likePost called", { id, shouldLike });

  const target = posts.value.find((p) => p.id === id);
  const isCurrent = currentPost.value?.id === id;
  const targetPost = target || currentPost.value;

  const prev = target
    ? { likeCount: target.likeCount || 0, liked: Boolean(target.liked) }
    : null;

  const curPrev = isCurrent
    ? {
        likeCount: currentPost.value.likeCount || 0,
        liked: Boolean(currentPost.value.liked)
      }
    : null;

  // ✅ 正确判断：只有明确带 questionId 的才是 Answer
  const isAnswer =
    targetPost &&
    targetPost.questionId != null;

  // ===== 乐观更新 =====
  const applyLike = (obj, prevState) => {
    if (!obj || !prevState) return;
    if (shouldLike && !prevState.liked) {
      obj.likeCount = prevState.likeCount + 1;
      obj.liked = true;
    } else if (!shouldLike && prevState.liked) {
      obj.likeCount = Math.max(0, prevState.likeCount - 1);
      obj.liked = false;
    }
  };

  applyLike(target, prev);
  applyLike(currentPost.value, curPrev);

  try {
    if (isAnswer) {
      await request.post("/answer/like", {
        id,
        like: !!shouldLike
      });
    } else {
      await request.post("/question/like", {
        id,
        like: !!shouldLike
      });
    }
  } catch (e) {
    console.error("likePost failed", e);

    // 回滚
    if (target && prev) {
      target.likeCount = prev.likeCount;
      target.liked = prev.liked;
    }
    if (isCurrent && curPrev) {
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
    if (!content || !content.trim()) return null;
    try {
      const payload = { postId, content };
      const res = await request.post(`/comment/create`, payload).catch(() => null);
      const data = res?.data?.data || res?.data || null;
      // 若后端返回新评论对象，加入缓存
      const newComment = data && data.comment ? data.comment : data;
      if (newComment) {
        postComments.value[postId] = postComments.value[postId] || [];
        postComments.value[postId].unshift(newComment);
        return newComment;
      }
      // 若后端没有返回对象，则放一个本地构造的临时对象
      const tmp = {
        id: Date.now(),
        author: user || { name: "匿名" },
        content,
        createdAt: new Date().toLocaleString(),
        likes: 0
      };
      postComments.value[postId] = postComments.value[postId] || [];
      postComments.value[postId].unshift(tmp);
      return tmp;
    } catch (e) {
      console.error("addComment failed", e);
      throw e;
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

