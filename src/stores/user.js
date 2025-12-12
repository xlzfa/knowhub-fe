import { defineStore } from "pinia";
import { computed, ref } from "vue";

const TOKEN_KEY = "konwhub_token";

export const useUserStore = defineStore("user", () => {
  const token = ref(localStorage.getItem(TOKEN_KEY));
  const currentUser = ref(null);

  const isLoggedIn = computed(() => Boolean(token.value));

  function setToken(value) {
    token.value = value;
    if (value) {
      localStorage.setItem(TOKEN_KEY, value);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  async function login(username, _password) {
    // TODO: 调用后端登录接口
    throw new Error("登录功能未接入，请连接后端接口");
  }

  function logout() {
    setToken(null);
    currentUser.value = null;
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

