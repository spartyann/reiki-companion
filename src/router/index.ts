import { createRouter, createWebHashHistory } from 'vue-router'

const ONBOARDING_KEY = 'reiki_onboarding_completed'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('../views/OnboardingView.vue'),
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/music',
      name: 'music',
      component: () => import('../views/music/MusicSessionView.vue'),
    },
    {
      path: '/music/new',
      name: 'music-new',
      component: () => import('../views/music/ThemeFormView.vue'),
    },
    {
      path: '/music/:id/edit',
      name: 'music-edit',
      component: () => import('../views/music/ThemeFormView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const completed = localStorage.getItem(ONBOARDING_KEY) === 'true'
  if (!completed && to.name !== 'onboarding') {
    return { name: 'onboarding' }
  }
  if (completed && to.name === 'onboarding') {
    return { name: 'home' }
  }
})

export default router
