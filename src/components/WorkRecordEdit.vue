<script setup lang="ts">
import {delRequest, type ErrorMessage, getRequest, postRequestNoResult, putRequest} from "../net/api.ts";
import {ADD_WORK_RECORDS} from "../net/app-url.ts";
import {onMounted, ref, watch} from "vue";
import {currentDateToString} from "../util/date-util.ts";
import {useRoute, useRouter} from "vue-router";
import {Snackbar} from "@varlet/ui";
import type {WorkRecord} from "../bean/WorkRecord.ts";
import moment from "moment";

let isShowPickerDateDialog = ref(false);
let isShowDeleteDialog = ref(false);
const router = useRouter();
const route = useRoute();
let workRecordId = route.params.workRecordId;

let pageTitle = ref("添加工作记录");
let singleMultipleProductSamePrice = ref(true);

let teamSize = ref<string>("");
let singleProductQuantity = ref("");
let multiProductQuantity = ref("");
let singleProductPrice = ref("");
let multipleProductPrice = ref("");
let productPricePlaceholder = ref("请输入产品单价");

let selectDate = ref(currentDateToString);
let lastPickDate = ref(selectDate.value);
let workTypeSelectValue = ref(0)
let workTypeRadio = ref([
  {
    name: "单人",id: 0
  },
  {
    name: "多人",id: 1
  },
  {
    name: "混合",id: 2
  }
])
function singleProductPriceInput():Boolean{
  switch (workTypeSelectValue.value) {
    case 0: return true;
    case 1: return false;
    case 2: return !singleMultipleProductSamePrice.value;
  }
  return false;
}
function openPickerDateDialog(){
  lastPickDate.value = selectDate.value;
  isShowPickerDateDialog.value = true;
}
function closePickerDateDialog(closeType: number){
  console.log(selectDate.value);
  if (closeType == 0 && lastPickDate.value != selectDate.value){
    selectDate.value = lastPickDate.value;
  }
  isShowPickerDateDialog.value = false;
  console.log(selectDate.value);
}
function getWorkRecord(){
  getRequest<WorkRecord>(ADD_WORK_RECORDS + "/" + workRecordId,{
    onSuccess: (data?:WorkRecord) => {
      if (null == data) return;
      teamSize.value = data.teamSize.toString();
      singleProductPrice.value = data.singleProductPrice.toString();
      multipleProductPrice.value = data.multipleProductPrice.toString();
      multiProductQuantity.value = data.multipleProductQuantity.toString();
      singleProductQuantity.value = data.singleProductQuantity.toString();
      selectDate.value = moment(data.workDate).format("YYYY-MM-DD");
      if (data.singleProductPrice == data.multipleProductPrice){
        singleMultipleProductSamePrice.value = true;
      }
      if (data.teamSize == 0){
        workTypeSelectValue.value = 0;
      }else if (data.singleProductQuantity == 0){
        workTypeSelectValue.value = 1;
      }else {
        workTypeSelectValue.value = 2;
      }
    },
    onFailure: (err?: ErrorMessage) => {
      Snackbar["error"](err?.message ?? "");
    }
  });
}

function submit(){
  if (workTypeSelectValue.value == 0){
    if (isNaN(parseFloat(singleProductQuantity.value))){
      Snackbar["error"]("请输入产品数量")
      return;
    }
    if (isNaN(parseFloat(singleProductPrice.value))){
      Snackbar["error"]("请输入产品单价")
      return;
    }
    multipleProductPrice.value = "0"
    multiProductQuantity.value = "0"
    teamSize.value = "0";
  }else if (workTypeSelectValue.value == 1){
    if (parseInt(teamSize.value) < 2){
      Snackbar["error"]("团队人数应大于1")
      return;
    }
    if (isNaN(parseFloat(multiProductQuantity.value))){
      Snackbar["error"]("请输入产品数量")
      return;
    }
    if (isNaN(parseFloat(multipleProductPrice.value))){
      Snackbar["error"]("请输入产品单价")
      return;
    }
    singleProductPrice.value = "0"
    singleProductQuantity.value = "0"
  }else if (workTypeSelectValue.value == 2){
    if (isNaN(parseInt(teamSize.value)) || parseInt(teamSize.value) < 2){
      Snackbar["error"]("团队人数应大于1")
      return;
    }
    if (isNaN(parseFloat(singleProductQuantity.value))){
      Snackbar["error"]("请输入单人产品数量")
      return;
    }
    if (isNaN(parseFloat(multiProductQuantity.value))){
      Snackbar["error"]("请输入多人产品数量")
      return;
    }
    if (isNaN(parseFloat(multipleProductPrice.value))){
      Snackbar["error"]("请输入产品单价")
      return;
    }
    if (!singleMultipleProductSamePrice.value && isNaN(parseFloat(multipleProductPrice.value))){
      Snackbar["error"]("请输入单人产品单价")
    }
    if (singleMultipleProductSamePrice.value){
      singleProductPrice.value = multipleProductPrice.value
    }
  }
  if (route.params["type"] == "1"){
    updateWorkRecord();
  }else {
    submitAddWorkRecord()
  }
}

function submitAddWorkRecord(){
  postRequestNoResult(ADD_WORK_RECORDS,{
    params: {
      "teamSize": parseInt(teamSize.value),
      "workDate": selectDate.value,
      "multipleProductPrice": parseFloat(multipleProductPrice.value),
      "singleProductPrice": parseFloat(singleProductPrice.value),
      "singleProductQuantity": parseFloat(singleProductQuantity.value),
      "multipleProductQuantity": parseFloat(multiProductQuantity.value)
    },
    onSuccess: () => {
      Snackbar["success"]("保存成功")
    },
    onFailure: (err) => {
      Snackbar["error"](err?.message ?? "");
    }
  });
}

function updateWorkRecord(){
  if (workTypeSelectValue.value == 2 && singleMultipleProductSamePrice.value){
    singleProductPrice.value = multipleProductPrice.value;
  }
  putRequest(ADD_WORK_RECORDS + "/" + workRecordId,{
    params: {
      "teamSize": parseInt(teamSize.value),
      "workDate": selectDate.value,
      "multipleProductPrice": parseFloat(multipleProductPrice.value),
      "singleProductPrice": parseFloat(singleProductPrice.value),
      "singleProductQuantity": parseFloat(singleProductQuantity.value),
      "multipleProductQuantity": parseFloat(multiProductQuantity.value)
    },
    onSuccess: () => {
     Snackbar["success"]("更新成功")
    },
    onFailure: (err) => {
      Snackbar["error"](err?.message ?? "");
    }
  });
}

function deleteWorkRecord(){
  delRequest(ADD_WORK_RECORDS + "/" + workRecordId,{
    onSuccess: () => {
      Snackbar["success"]("删除成功");
    },
    onFailure: (err?: ErrorMessage) => {
      Snackbar["error"](err?.message ?? "");
    }
  });
}
onMounted(() => {
  if (route.params["type"] == "1"){
    pageTitle.value = "更新工作记录";
    getWorkRecord();
  }else {
    pageTitle.value = "添加工作记录";
  }
})
watch(workTypeSelectValue, ()=> {
  if (workTypeSelectValue.value != 2){
    productPricePlaceholder.value = "请输入产品单价";
  }else {
    productPricePlaceholder.value = "请输入多人产品单价";
  }
})

</script>

<template>
  <var-app-bar safe-area-top fixed placeholder>
    {{pageTitle}}
    <template #left>
      <var-button color="transparent" text round @click="router.back()">
        <var-icon name="chevron-left" :size="32"/>
      </var-button>
    </template>
    <template #right>
      <var-button text @click="isShowDeleteDialog = true">
        <template #default>
          <var-icon name="delete" size="26"/>
        </template>
      </var-button>
    </template>
  </var-app-bar>

  <var-space class="work-record-date-space" align="center" direction="row" justify="space-between">
    <p class="work-record-date">{{selectDate}}</p>
    <var-icon name="magnify" size="30" @click="openPickerDateDialog()"/>
  </var-space>
  <p class="work-type-title">请选择工作方式：</p>
  <var-radio-group
      class="radio-group"
      v-model="workTypeSelectValue"
      :options="workTypeRadio"
      label-key="name"
      value-key="id"
  />

  <var-input
      class="work-input"
      v-model.number="teamSize"
      type="number"
      clearable
      v-if="workTypeSelectValue != 0"
      placeholder="请输入团队人数" />
  <var-input
      class="work-input"
      v-model.number="singleProductQuantity"
      type="number"
      clearable
      v-if="workTypeSelectValue != 1"
      placeholder="请输入单人产品数量" />
  <var-input
      class="work-input"
      v-if="singleProductPriceInput()"
      v-model.number="singleProductPrice"
      type="number"
      clearable
      placeholder="请输入单人产品单价" />
  <var-input
      class="work-input"
      v-model.number="multiProductQuantity"
      type="number"
      clearable
      v-if="workTypeSelectValue != 0"
      placeholder="请输入多人产品数量" />
  <var-input
      class="work-input work-input-price"
      v-model.number="multipleProductPrice"
      type="number"
      clearable
      v-if="workTypeSelectValue != 0"
      :placeholder="productPricePlaceholder" />

  <var-space v-show="workTypeSelectValue == 2" class="price-switch" direction="row" align="center" justify="start">
    <var-switch v-model="singleMultipleProductSamePrice" />
    <p>单人产品价格与多人相同</p>
  </var-space>

  <var-button class="submit-btn" size="large" type="primary" block @click="submit">确定</var-button>

  <var-dialog
  title="提示"
  message="确定要删除此工作记录吗？"
  v-model:show="isShowDeleteDialog"
  @confirm="deleteWorkRecord"
  ></var-dialog>

  <var-overlay v-model:show="isShowPickerDateDialog" class="date-picker-dialog">
    <var-paper radius="10" elevation="2" class="date-picker-bg">
      <var-date-picker
          elevation="false"
          title-color="transparent"
          class="date-picker"
          v-model="selectDate"
      />
      <var-space justify="flex-end">
        <var-button class="dialog-action-btn" text color="transparent" @click="closePickerDateDialog(0)">取消</var-button>
        <var-button class="dialog-action-btn" text color="transparent" @click="closePickerDateDialog(1)">确定</var-button>
      </var-space>
    </var-paper>
  </var-overlay>

</template>

<style scoped>
  .dialog-action-btn {
    padding: 10px;
    font-size: 18px;
    margin-bottom: 10px;
    margin-top: 10px;
    margin-right: 10px;
    text-align: center;
    align-content: center;
    justify-content: center;
  }
  .work-record-date-space {
    margin-left: 20px;
    margin-right: 20px;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 10px;
  }
  .work-record-date {
    margin: 0 auto;
    font-size: 24px;
    font-weight: bold;
  }
  .radio-group {
    width: 100%;
    margin-top: 20px;
    justify-content: space-between;
  }
  .work-input {
    margin-top: 15px;
    margin-left: 10px;
    margin-right: 10px;
  }
  .work-type-title {
    font-size: 20px;
    font-weight: bold;
    margin-left: 10px;
  }
  .work-input-price {
    margin-bottom: 20px;
  }
  .date-picker-dialog {
    justify-content: center;
    align-items: center;
    margin-left: 40px;
    margin-right: 40px;
  }
  .submit-btn {
    margin-top: 30px;
  }


</style>