import Vue from 'vue';
import Router from 'vue-router';
// import Home from './views/Home.vue';
import SplashScreen from './views/Splashscreen.vue';

Vue.use(Router);

export default new Router({
	mode: 'history',
	base: process.env.BASE_URL,
	routes: [
		{
			path: '/',
			name: 'splashscreen',
			component: SplashScreen
		},
		{
			path: '/home',
			name: 'home',
			// component: Home
			component: () => import(/* webpackChunkName: "home" */ './views/Home.vue')
		},
		{
			path: '/about',
			name: 'about',
			// route level code-splitting
			// this generates a separate chunk (about.[hash].js) for this route
			// which is lazy-loaded when the route is visited.
			component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
		}
	]
});
