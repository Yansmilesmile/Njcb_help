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
    path: "/details",
    name: "details",
    component: () => import("../views/details.vue"),
  },
  {
    path: "/add",
    name: "add",
    component: () => import("../views/add.vue"),
  },
];

const router = new VueRouter({
  mode: "hash",
  base: process.env.BASE_URL,
  routes,
});

export default router;
