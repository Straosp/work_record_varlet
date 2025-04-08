<script setup lang="ts">

import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import { type WorkRecord} from "../bean/WorkRecord";
import {delRequest, type ErrorMessage, getRequest} from "../net/api.ts";
import {month, year} from "../util/date-util";
import {ADD_WORK_RECORDS, WORK_RECORDS_MONTH_DETAIL, WORK_RECORDS_MONTH_SUMMARY} from "../net/app-url.ts";
import {Snackbar} from "@varlet/ui";
import type {MonthWorkSummary} from "../bean/MonthWorkSummary.ts";

const router = useRouter();

let monthWorkRecords = ref<WorkRecord[]>([])
let historyGridColumnCount = ref(3);
let loadYear = ref(year);
let loadMonth = ref(month);

let monthSalary = ref(0)
let monthWorkDays = ref(0)
let monthWorkProductQuantity = ref(0)
let monthSingleProductQuantity = ref(0)


const updateColumnCount = ()=> {
  const width = window.innerWidth;
  if (width <= 1000) {
    historyGridColumnCount.value = 1;
  }else if (width <= 1200) {
    historyGridColumnCount.value = 3;
  }else if (width <= 1400) {
    historyGridColumnCount.value = 4;
  }else if (width <= 1600) {
    historyGridColumnCount.value = 5;
  }else {
    historyGridColumnCount.value = 6;
  }
}


function getWorkRecordsSummary() {
  getRequest<WorkRecord[]>(WORK_RECORDS_MONTH_DETAIL,{
    params: {
      "year": loadYear.value,
      "month": loadMonth.value,
    },
    onSuccess: (data?: WorkRecord[]) => {
      if (null == data) return;
      monthWorkRecords.value = data;
    },
    onFailure: (err) => {
      console.log(err);
    }
  })
}

function getWorkRecordsDetails() {
  getRequest<MonthWorkSummary>(WORK_RECORDS_MONTH_SUMMARY,{
    params: {
      "year": loadYear.value,
      "month": loadMonth.value,
    },
    onSuccess: (data?: MonthWorkSummary) => {
      if (null == data) return;
      monthWorkDays.value = data?.workingDays ?? 0;
      monthWorkProductQuantity.value = data?.totalMultipleProductQuantity
      monthSingleProductQuantity.value = data?.totalSingleProductQuantity
      monthSalary.value = data?.totalSalary
    },
    onFailure: (err) => {
      console.log(err);
    }
  })
}
function calcTotalSalaryInDay(workRecord: WorkRecord) : number{
  if (workRecord.teamSize > 0){
    if (workRecord.singleProductQuantity > 0){
      return (workRecord.singleProductQuantity * workRecord.singleProductPrice) + ( workRecord.multipleProductQuantity * workRecord.multipleProductPrice) / workRecord.teamSize;
    }else {
      return ( workRecord.multipleProductQuantity * workRecord.multipleProductPrice) / workRecord.teamSize;
    }
  }else {
    return (workRecord.singleProductQuantity * workRecord.singleProductPrice);
  }
}


function up(){
  if (loadMonth.value==1){
    loadYear.value = loadYear.value - 1;
    loadMonth.value = 12;
  }else {
    loadMonth.value = loadMonth.value - 1;
  }
  getWorkRecordsSummary();
  getWorkRecordsDetails();
}
function next(){
  if (loadMonth.value== month){
    Snackbar["info"]("以后的日子未来再探索吧")
    return;
  }
  if (loadMonth.value==12){
    loadYear.value = loadYear.value + 1;
    loadMonth.value = 1;
  }else {
    loadMonth.value = loadMonth.value + 1;
  }
  getWorkRecordsSummary();
  getWorkRecordsDetails();
}

function toAddUpdateWorkRecord(data: WorkRecord){
  router.push({
    name: "WorkRecordEdit",
    params: {
      "type": 1,
      "workRecordId": data?.id ?? 0
    }
  })
}

onMounted(() => {
  if (window.localStorage.getItem("token") == null){
    router.push("/")
  }
  window.addEventListener("resize", updateColumnCount);
  updateColumnCount();
  getWorkRecordsSummary();
  getWorkRecordsDetails()
})
</script>

<template>
  <var-app-bar safe-area-top fixed placeholder>
    历史记录
    <template #left>
      <var-button color="transparent" text round @click="router.back()">
        <var-icon name="chevron-left" :size="24"/>
      </var-button>
    </template>
  </var-app-bar>

  <var-space align="center" justify="space-around">
    <var-icon name="chevron-left" size="45" @click="up" />
    <h2>{{ loadYear }}年{{loadMonth}}月</h2>
    <var-icon name="chevron-right" size="45" @click="next" />
  </var-space>

  <var-paper class="month-tab" radius="10" elevation="2">
    <var-space justify="space-around">
      <div class="card-item">
        <p class="card-item-content">{{monthWorkDays}}</p>
        <p class="card-item-title">本月工作天数</p>
      </div>
      <div class="card-item">
        <p class="card-item-content">{{monthWorkProductQuantity}}</p>
        <p class="card-item-title">本月产品件数</p>
      </div>
      <div class="card-item">
        <p class="card-item-content">{{monthSalary}}</p>
        <p class="card-item-title">本月总工资</p>
      </div>
    </var-space>
  </var-paper>

  <p class="work-record-title" v-show="monthWorkRecords.length>0">本月工作记录</p>
  <div v-if="monthWorkRecords.length>0" v-for="wk in monthWorkRecords">
    <var-paper elevation="2" radius="10" class="work-record-card" @click="toAddUpdateWorkRecord(wk)">
      <a class="card-date">{{ wk.workDate }}</a>
      <var-space justify="space-around">
        <div class="card-item">
          <p class="card-item-content" v-if="wk.teamSize > 0 && wk.singleProductQuantity > 0">{{ wk.multipleProductQuantity }}({{wk.singleProductQuantity}})</p>
          <p class="card-item-content" v-else-if="wk.teamSize > 0 && wk.singleProductQuantity == 0">{{ wk.multipleProductQuantity }}</p>
          <p class="card-item-content" v-else >{{ wk.singleProductQuantity }}</p>
          <p class="card-item-title">产品数量</p>
        </div>
        <div class="card-item">
          <p class="card-item-content">{{ calcTotalSalaryInDay(wk) }}</p>
          <p class="card-item-title">所得工资</p>
        </div>
        <div class="card-item">
          <p class="card-item-content" v-if="wk.teamSize > 0 && wk.singleProductQuantity > 0">{{ wk.multipleProductQuantity / wk.teamSize }}({{wk.singleProductQuantity}})</p>
          <p class="card-item-content" v-else-if="wk.teamSize > 0 && wk.singleProductQuantity == 0">{{ wk.multipleProductQuantity / wk.teamSize }}</p>
          <p class="card-item-content" v-else >{{ wk.singleProductQuantity }}</p>
          <p class="card-item-title">个人综合产量</p>
        </div>
      </var-space>
    </var-paper>
  </div>
  <p class="work-record-title" v-show="monthWorkRecords.length < 1">
    本月暂无工作记录
  </p>
</template>

<style scoped>
  .month-tab {
  margin-top: 10px;
}
  .work-record-title {
    text-align: center;
    font-size: 20px;
    font-weight: bold;
  }
  .work-record-card {
    margin-top: 10px;
    justify-content: center;
    text-align: center;
    padding-top: 5px;
  }
  .card-item {
    float: left;
    text-align: center;
    justify-content: center;
    padding-top: 10px;
    padding-bottom: 10px;
  }
  .card-date {
    font-size: 18px;
    font-weight: 500;
    display: inline;
  }
  .card-item-content {
    font-size: 25px;
    font-weight: bold;
    display: inline;
  }
  .card-item-title {
    margin: 8px auto;
  }
</style>