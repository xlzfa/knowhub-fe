import axios from "axios";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

const TOKEN_KEY = "knowhub_token";

export const useUserStore = defineStore("user", () => {
  const token = ref(localStorage.getItem(TOKEN_KEY));
  const currentUser = ref(localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null);

  const isLoggedIn = computed(() => Boolean(token.value));

  function setToken(value) {
    token.value = value;
    if (value) {
      localStorage.setItem(TOKEN_KEY, value);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  async function login(username, password) {
  try {
    const response = await axios.post("http://localhost:8080/user/login", { username, password });
    // console.log("response.data:", response.data);

    // 注意这里取到 token
    const receivedToken = response.data.data.token;
    console.log("receivedToken:", receivedToken);

    // 保存 token
    setToken(receivedToken);

    // 保存用户信息
    currentUser.value = {
      id: response.data.data.id,
      name: response.data.data.username,
      avatar: response.data.data.avatar || '/src/images/default-avatar.jpg',
      bio: response.data.data.bio,
      email: response.data.data.email,
    };

    localStorage.setItem("user", JSON.stringify(currentUser.value));
  } catch (err) {
    console.error("登录失败:", err);
    throw err;
  }
}


  function logout() {
    setToken(null);
    currentUser.value = null;
    localStorage.removeItem("user");
    localStorage.removeItem(TOKEN_KEY);


  }

  function register(username) {
    // TODO: 调用后端注册接口
    throw new Error("注册功能未接入，请连接后端接口");
  }

  return {
    token,
    currentUser,
    isLoggedIn,
    login,
    logout,
    register
  };
});

