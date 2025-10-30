import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/detail/:type",
    name: "Detail",
    component: () => import("../views/Detail.vue"),
  },
  {
    path: "/shalong",
    name: "shalong",
    component: () => import("../views/shalong.vue"),
  },
];

const router = new VueRouter({
  mode: "hash",
  base: process.env.BASE_URL,
  routes,
});

export default router;
