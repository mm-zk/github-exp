// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: ["@nuxt/ui-pro"],
  modules: ["@nuxt/ui", "@pinia/nuxt"],
  app: {
    head: {
      title: "zkSync + wagmi + Nuxt 3",
    },
  },
  ssr: false,
  devtools: { enabled: true },
  ui: {
    icons: ["octicon"],
  },
  pinia: {
    autoImports: [
      // automatically imports `defineStore`
      "defineStore",
      "storeToRefs",
    ],
  },
  imports: {
    dirs: ["store"],
  },
});
