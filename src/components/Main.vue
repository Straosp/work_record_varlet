<script setup lang="ts">
import {onMounted, reactive, ref} from 'vue'
import {useRouter} from "vue-router";
import {
  LUNAR_YEAR_WORK_RECORDS_SUMMARY,
  LUNAR_YEAR_WORK_SUMMARY_GROUP_MONTH,
  WORK_RECORDS_MONTH_DETAIL
} from "../net/app-url.ts";
import {type ErrorMessage, getRequest, TOKEN_TIME_OUT} from "../net/api.ts";
import { type WorkRecord } from "../bean/WorkRecord";
import {month, year} from "../util/date-util.ts";
import type {LunarYearWorkSummary} from "../bean/LunarYearWorkSummary.ts";
import type {MonthWorkSummary} from "../bean/MonthWorkSummary.ts";
import {Chart, type TooltipItem} from "chart.js/auto";
import {useColorMode} from "@vueuse/core";

const router = useRouter();

let isShowMonthRecords = ref(false);

let monthSalary = ref(0);
let monthWorkDays = ref(0);
let monthWorkProductQuantity = ref(0);

let yearTotalSalary = ref(0);
let yearSingleProductQuantity = ref(0);
let yearMultipleProductQuantity = ref(0);
let currentMonthWorkRecords = ref<WorkRecord[]>([]);

let xAxisTitle = ref<string[]>([]);
let yAxisMultipleProductQuantity = ref<number[]>([]);
let yAxisSingleProductQuantity = ref<number[]>([]);
let monthTotalSalary = ref<number[]>([]);

let yMultipleSalary = ref<number[]>([]);
let ySingleSalary = ref<number[]>([]);



let chartSeries = ref({})
let chartOptions = ref({})

function exitLogin(){
  window.localStorage.removeItem("token")
  router.push('/')
}
function yearReport(){
  router.push("/yearReport");
}
function toHistory(){
  router.push('/history')
}
function toAddUpdateWorkRecord(data: WorkRecord | null){
  router.push({
    name: "WorkRecordEdit",
    params: {
      "type": data == null ? 0 : 1,
      "workRecordId": data?.id ?? 0
    }
  })
}



function getCurrentMonthWorkRecord(){
  getRequest<WorkRecord[]>(WORK_RECORDS_MONTH_DETAIL,{
    params: {
      "month": month,
      "year": year
    },
    onSuccess: (data) => {
      if (null == data){
        return;
      }
      isShowMonthRecords.value = data.length > 0;
      monthWorkDays.value = data.length;
      monthWorkProductQuantity.value = data.reduce<number>((last,e)=> { return last + e.multipleProductQuantity + e.singleProductQuantity; },0)
      monthSalary.value = data.reduce<number>((last,e)=> { return last + (calcTotalSalaryInDay(e)); },0 )
      currentMonthWorkRecords.value = data;
    },
    onFailure: (error?: ErrorMessage) => {
      if (error?.code == TOKEN_TIME_OUT){
        window.localStorage.removeItem("token");
        router.replace("/")
      }
      isShowMonthRecords.value = false;
    }
  })
}

function getLunarYearWorkRecordSummary(){
  getRequest<LunarYearWorkSummary>(LUNAR_YEAR_WORK_RECORDS_SUMMARY,{
    params: {
      "year": year,
    },
    onSuccess: (data) => {
      if (null == data){
        return;
      }
      yearTotalSalary.value = data.totalSalary ?? 0;
      yearSingleProductQuantity.value = data.totalSingleProductQuantity ?? 0;
      yearMultipleProductQuantity.value = data.totalMultipleProductQuantity ?? 0;
    },
    onFailure: (error?: ErrorMessage) => {
      if (error?.code == TOKEN_TIME_OUT){
        window.localStorage.removeItem("token");
        router.replace("/")
      }
      isShowMonthRecords.value = false;
    }
  })
}

function getLunarYearWorkSummaryGroupMonth(){
  getRequest<MonthWorkSummary[]>(LUNAR_YEAR_WORK_SUMMARY_GROUP_MONTH,{
    params: {
      "year": year,
    },
    onSuccess: (data) => {
      if (null == data) return;
      xAxisTitle.value = data.map((s) => s .workDate);
      yAxisMultipleProductQuantity.value = data.map((s) => s.totalMultipleProductQuantity);
      yAxisSingleProductQuantity.value = data.map((s) => s.totalSingleProductQuantity);
      monthTotalSalary.value = data.map((s) => s.totalSalary);
      ySingleSalary.value = data.map((s) => {
        let totalQuantity = s.totalMultipleProductQuantity + s.totalSingleProductQuantity;
        return Math.round(s.totalSalary * ( s.totalSingleProductQuantity / totalQuantity ));
      });
      yMultipleSalary.value = data.map((s) => {
        let totalQuantity = s.totalMultipleProductQuantity + s.totalSingleProductQuantity;
        return Math.round(s.totalSalary * ( s.totalMultipleProductQuantity / totalQuantity ));
      });
      initChartBar();
    },
    onFailure: (error?: ErrorMessage) => {
      if (error?.code == TOKEN_TIME_OUT){
        window.localStorage.removeItem("token");
        router.replace("/")
      }
    }
  })
}

function initChartBar(){
  let chartBar = document.getElementById("chart-bar") as HTMLCanvasElement;
  new Chart(chartBar, {
    type: "bar",
    data: {
      labels: xAxisTitle.value,
      datasets: [
        {
          label: "月工资",
          backgroundColor: "#ee6666",
          data: monthTotalSalary.value,
          borderRadius: 5,
          maxBarThickness: 30,
          grouped: true,
          order: 3
        },
        {
          label: "单人产品数量",
          backgroundColor: "#fac858",
          data: yAxisSingleProductQuantity.value,
          borderRadius: 5,
          maxBarThickness: 30,
          grouped: true,
          order: 1
        },
        {
          label: "多人产品数量",
          backgroundColor: "#5470c6",
          data: yAxisMultipleProductQuantity.value,
          borderRadius: 5,
          maxBarThickness: 30,
          grouped: true,
          order: 2,
        },
      ]
    },
    options: {
      color: useColorMode().value == "light" ? "#000000" : "#FFFFFF",
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      layout: {
        autoPadding: false,
        padding: 5,
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            color: useColorMode().value == "light" ? "#000000" : "#FFFFFF"
          },
          grid: {
            color: useColorMode().value == "light" ? "#CCCCCC" : "#919191",
          }
        },
        y: {
          ticks: {
            color: useColorMode().value == "light" ? "#000000" : "#FFFFFF"
          },
          grid: {
            color: useColorMode().value == "light" ? "#CCCCCC" : "#919191",
          }
        },
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: useColorMode().value == "light" ? "#000000" : "#ffffff"
          },
        },
        tooltip: {
          enabled: true,
        },
      }
    }
  });

}

function calcTotalSalaryInDay(workRecord: WorkRecord) : number {
  if (workRecord.teamSize > 0){
    if (workRecord.singleProductQuantity > 0){
      return (workRecord.singleProductQuantity * workRecord.singleProductPrice) + ( workRecord.multipleProductPrice * workRecord.multipleProductQuantity) / workRecord.teamSize;
    }else {
      return ( workRecord.multipleProductPrice * workRecord.multipleProductQuantity) / workRecord.teamSize;
    }
  }else {
    return (workRecord.singleProductQuantity * workRecord.singleProductPrice);
  }
}

onMounted(() => {
  if (window.localStorage.getItem("token") == null){
    router.push("/")
  }
  getCurrentMonthWorkRecord();
  getLunarYearWorkRecordSummary();
  getLunarYearWorkSummaryGroupMonth();
})

</script>

<template>
  <var-app-bar title="工作记录" fixed placeholder safe-area-top>
    <template #right>
      <var-menu>
        <var-button color="transparent" text-color="#fff" round  text>
          <var-icon name="menu" size="24"/>
        </var-button>
        <template #menu>
          <var-cell variant="text" @click="toAddUpdateWorkRecord(null)">添加记录</var-cell>
          <var-cell variant="text" @click="toHistory">历史记录</var-cell>
          <var-cell variant="text" @click="exitLogin">退出登录</var-cell>
          <var-cell variant="text" @click="yearReport">年度报告</var-cell>
        </template>
      </var-menu>
    </template>
  </var-app-bar>

  <!-- 月工作记录 -->
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
  <!-- 年工作记录 -->
  <var-paper class="year-tab" radius="10" elevation="2">
    <var-space justify="space-around">
      <div class="card-item">
        <p class="card-item-content">{{yearMultipleProductQuantity + yearSingleProductQuantity}}</p>
        <p class="card-item-title">年度总件数</p>
      </div>
      <div class="card-item">
        <p class="card-item-content">{{yearSingleProductQuantity}}</p>
        <p class="card-item-title">年度个人总件数</p>
      </div>
      <div class="card-item">
        <p class="card-item-content">{{yearTotalSalary}}</p>
        <p class="card-item-title">年度总工资</p>
      </div>
    </var-space>
  </var-paper>
  <div class="chart-div">
    <canvas id="chart-bar" class="chart-div"></canvas>
  </div>

  <p class="work-record-title" v-show="currentMonthWorkRecords.length>0">本月工作记录</p>
  <div v-if="currentMonthWorkRecords.length>0" v-for="wk in currentMonthWorkRecords">
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
  <p class="work-record-title" v-show="currentMonthWorkRecords.length < 1">
    本月暂无工作记录
  </p>

</template>

<style scoped>
  .month-tab {
    margin-top: 10px;
  }
  .year-tab {
    margin-top: 20px;
  }
  .work-record-title {
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    margin: 0 auto;
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
  .chart-div {
    margin-top: 10px;
    height: 280px;
    width: 100%;
  }


</style>