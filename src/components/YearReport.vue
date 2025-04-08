<script setup lang="ts">
import {onMounted, ref} from "vue";
  import {useRouter} from "vue-router";
  import type {YearSummaryReport} from "../bean/YearSummaryReport.ts";
  import {type ErrorMessage, getRequest} from "../net/api.ts";
import {LUNAR_YEAR_WORK_SUMMARY_GROUP_MONTH, YEAR_SUMMARY_REPORT} from "../net/app-url.ts";
import { year } from "../util/date-util";
import {Chart} from "chart.js/auto";
import {useColorMode} from "@vueuse/core";
import type {MonthWorkSummary} from "../bean/MonthWorkSummary.ts";


  const router = useRouter()
  let totalSalary = ref(0)
  let singleProductQuantity = ref(0)
  let multipleProductQuantity = ref(0)
  let totalWorkDays = ref(0)

  let monthSingleProductQuantity = ref<number[]>([])
  let monthMultipleProductQuantity = ref<number[]>([])
  let monthSalary = ref<number[]>([])
  let xAxisTitle = ref<string[]>([])

  function getYearReport() {
    getRequest<YearSummaryReport>(YEAR_SUMMARY_REPORT,{
      params:{
        "year": year,
      },
      onSuccess: (data?:YearSummaryReport) => {
        if (null == data) return;
        totalSalary.value = data.salary;
        multipleProductQuantity.value = data.multipleProductQuantity;
        singleProductQuantity.value = data.singleProductQuantity;
        totalWorkDays.value = data.workDays;
      },
      onFailure: (err?:ErrorMessage) => {
        console.log(err)
      }
    })
  }
  function getYearSummary(){
    getRequest<MonthWorkSummary[]>(LUNAR_YEAR_WORK_SUMMARY_GROUP_MONTH,{
      params:{
        "year": year,
      },
      onSuccess: (data?:MonthWorkSummary[]) => {
        if (null == data) return;
        monthSingleProductQuantity.value = data.map( (e) => e.totalSingleProductQuantity )
        monthMultipleProductQuantity.value = data.map( (e) => e.totalMultipleProductQuantity )
        monthSalary.value = data.map( (e) => e.totalSalary )
        xAxisTitle.value = data.map((e) => e.workDate )
        initChartBar();
      },
      onFailure: (err?:ErrorMessage) => {
        console.log(err)
      }
    });
  }

function initChartBar(){
  let chartBar = document.getElementById("chart") as HTMLCanvasElement;
  new Chart(chartBar, {
    type: "bar",
    data: {
      labels: xAxisTitle.value,
      datasets: [
        {
          label: "月工资",
          backgroundColor: "#ee6666",
          data: monthSalary.value,
          borderRadius: 5,
          maxBarThickness: 10,
          grouped: true,
          order: 3
        },
        {
          label: "单人件数",
          backgroundColor: "#fac858",
          data: monthSingleProductQuantity.value,
          borderRadius: 5,
          maxBarThickness: 10,
          grouped: true,
          order: 1
        },
        {
          label: "团队件数",
          backgroundColor: "#5470c6",
          data: monthMultipleProductQuantity.value,
          borderRadius: 5,
          maxBarThickness: 10,
          grouped: true,
          order: 2,
        },
      ]
    },
    options: {
      indexAxis: "y",
      responsive: true,
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

  onMounted(()=> {
    getYearReport();
    getYearSummary();
  })

</script>

<template>
  <var-app-bar safe-area-top fixed placeholder>
    年度总结
    <template #left>
      <var-button color="transparent" text round @click="router.back()">
        <var-icon name="chevron-left" :size="24"/>
      </var-button>
    </template>
  </var-app-bar>

  <p>今年一共挣了{{totalSalary}}, 真的辛苦了</p>

  <p>其中，个人件数: {{singleProductQuantity}}</p>
  <p>多人产品件数: {{multipleProductQuantity}}</p>


  <div class="chart-div">
    <canvas id="chart"></canvas>
  </div>

  <p>今年一共上了{{totalWorkDays}} 天班，这么多天，一定很辛苦吧</p>

</template>

<style scoped>
  .chart-div{
    width: 100%;
    height: 280px;
  }
</style>