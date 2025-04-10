<template>
  <div class="app-container">
    <div v-if="showVantaBackground" ref="vantaRef" class="vanta-background"></div>
    <NavBar 
      :is-logged-in="isLoggedIn" 
      :is-admin="isAdmin" 
      @logout="handleLogout" 
    />
    <main class="main-content">
      <slot></slot>
    </main>
    <SiteFooter v-if="showFooter" />
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue';
import SiteFooter from '@/components/SiteFooter.vue';
import backgroundService from '@/services/backgroundService';

export default {
  name: "DefaultLayout",
  components: {
    NavBar,
    SiteFooter
  },
  props: {
    isLoggedIn: Boolean,
    isAdmin: Boolean,
  },
  data() {
    return {
      showVantaBackground: false,
      showFooter: true
    };
  },
  watch: {
    '$route'(to) {
      this.updateVantaBackground(to.path);
      this.showFooter = !to.path.startsWith('/admin');
    },
  },
  methods: {
    handleLogout() {
      this.$emit('logout');
    },
    updateVantaBackground(path) {
      if (path === "/") {
        this.showVantaBackground = true;
        this.$nextTick(() => {
          if (!backgroundService.vantaEffect) {
            backgroundService.initVantaEffect(this.$refs.vantaRef);
          }
        });
      } else {
        this.showVantaBackground = false;
        backgroundService.destroyVantaEffect();
      }
    }
  },
  mounted() {
    this.updateVantaBackground(this.$route.path);
  },
  beforeDestroy() {
    backgroundService.destroyVantaEffect();
  }
};
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.vanta-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: -1;
}

.main-content {
  flex: 1;
  padding-top: 44px;
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 84px);
  display: flex;
  flex-direction: column;
  padding-bottom: 40px;
}

.main-content > * {
  flex: 1;
}
</style>