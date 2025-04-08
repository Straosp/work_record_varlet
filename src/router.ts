import {createRouter, createWebHashHistory} from "vue-router";
import Main from "./components/Main.vue";
import Login from "./components/Login.vue";
import History from "./components/History.vue";
import WorkRecordEdit from "./components/WorkRecordEdit.vue";
import Register from "./components/Register.vue";
import YearReport from "./components/YearReport.vue";

const routes = [
    {
        path: "/",
        name: "Login",
        component: Login,
    },
    {
        path: "/main",
        name: "Main",
        component: Main,
    },
    {
        path: "/history",
        name: "History",
        component: History,
    },
    {
        path: "/workRecordEdit/:type/:workRecordId",
        name: "WorkRecordEdit",
        component: WorkRecordEdit,
    },
    {
        path: "/register",
        name: "Register",
        component: Register,
    },
    {
        path: "/yearReport",
        name: "YearReport",
        component: YearReport,
    }
]
const router = createRouter({
    history: createWebHashHistory(),
    routes,
})
export default router