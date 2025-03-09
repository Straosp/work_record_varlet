<script setup lang="ts">
// 组合式 API 风格
import {LoginAccount} from "../net/app-url.ts";
import {computed, onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {type ErrorMessage, postRequest} from "../net/api.ts";
import {type Token} from "../bean/Token.ts";
import {type AlertType, Snackbar} from "@varlet/ui";

const router = useRouter()
let phone = ref("")
let password = ref("")
let isShowLoadingAlert = ref(false);
let loadingAlertType = ref<AlertType>("info")
let loadingAlertMessage = ref("正在登录,请稍等....")
let loadingAlertTitle = ref("提示")


const phoneRules = computed(() => [
  (value: string) => {
    if (value.length == 11) {
      if (/^1[3-9]\d{9}$/.test(value)){
        return true;
      }else {
        return "手机号错误，请输入正确的手机号";
      }
    } else {
      return true;
    }
  }
])

function login() {
  if (phone.value.length != 11) {
    toastErrorMessage({code: 1,message: "请输入登录手机号"})
    return;
  }
  if (password.value.length < 6) {
    toastErrorMessage({code: 1,message: "密码不可为空且不小于6位"})
    return;
  }
  isShowLoadingAlert.value = true;
  loadingAlertType.value = "info"
  postRequest<Token>(LoginAccount,{
    params: {
      "phone": phone.value,
      "password": password.value
    },
    onSuccess: (data) => {
      isShowLoadingAlert.value = false;
      window.localStorage.setItem("token", data?.token ?? "");
      router.push("/main")
    },
    onFailure: (error?: ErrorMessage) => {
      loadingAlertType.value = "danger"
      isShowLoadingAlert.value = true;
      loadingAlertTitle.value = "登录出错"
      loadingAlertMessage.value = error?.message ?? "";
    }
  })
}
function toastErrorMessage(message: ErrorMessage | undefined) {
  Snackbar["error"](message?.message ?? "");
}

function goToRegister(){
  router.push("/register")
}


onMounted(()=> {
  if (window.localStorage.getItem("token") != null) {
    router.push("/main")
  }
})


</script>

<template>
  <var-app-bar
      title="工作记录"
      title-position="center"
      fixed
      placeholder
      elevation="1"
      safe-area-top>
  </var-app-bar>
  <var-alert v-show="isShowLoadingAlert" :title="loadingAlertTitle" :message="loadingAlertMessage" :type="loadingAlertType" />
  <var-form>
    <var-input
        class="phone-input"
        placeholder="请输入手机号"
        clearable
        type="tel"
        v-model="phone"
        :rules="phoneRules"
        variant="outlined">
      <template #prepend-icon>
        <var-icon class="prepend-icon" size="25" name="account-circle">mdi-account-circle</var-icon>
      </template>
    </var-input>
    <var-input
        class="password-input"
        type="password"
        clearable
        v-model="password"
        placeholder="请输入密码"
        variant="outlined">
      <template #prepend-icon>
        <var-icon class="prepend-icon" size="20" name="lock">mdi-lock</var-icon>
      </template>
    </var-input>
    <var-button class="login-btn" auto-loading loading-type="disappear" type="primary"  @click="login" size="large" block>登录</var-button>
  </var-form>

  <var-button class="register-title-btn" block text @click="goToRegister">去注册一个 -></var-button>
</template>

<style scoped>
  .phone-input {
    margin-top: 40px;
  }
  .password-input {
    margin-top: 20px;
  }
  .prepend-icon {
    margin-right: 10px;
  }
  .login-btn {
    margin-top: 30px;
    padding-top: 5px;
    padding-bottom: 5px;
    font-size: 20px;
  }
  .register-title-btn {
    font-size: 20px;
    margin-top: 40px;
  }
</style>