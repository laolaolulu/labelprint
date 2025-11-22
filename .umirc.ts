import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: '',
  },
  routes: [
    {
      path: '/',
      redirect: '/print',
    },
    // {
    //   name: '首页',
    //   path: '/home',
    //   component: './Home',
    // },
    // {
    //   name: '权限演示',
    //   path: '/access',
    //   component: './Access',
    // },
    // {
    //   name: ' CRUD 示例',
    //   path: '/table',
    //   component: './Table',
    // },
    {
      name: '打印模板',
      path: '/print',
      component: './Print',
      icon: 'SettingOutlined',
    },
    // {
    //   name: '生产模式',
    //   path: '/templates',
    //   component: './Templates',
    //   icon: 'SettingOutlined',
    // },
  ],
  npmClient: 'pnpm',
});
