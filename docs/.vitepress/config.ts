import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'FlowReader',
  description: 'Turn passive reading into active language learning with AI',
  lang: 'en-US',
  base: '/flow-reader/',

  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      title: 'FlowReader 心流阅读',
      description: '利用 AI 技术，将被动阅读转化为主动的语言学习体验',
    },
  },

  head: [['link', { rel: 'icon', href: '/icon-128.png' }]],

  themeConfig: {
    logo: '/icon-128.png',
    sidebar: {
      '/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quick-start' },
          ],
        },
        {
          text: 'Features',
          items: [
            { text: 'Overview', link: '/features/' },
            { text: 'Smart Simplification', link: '/features/smart-simplification' },
            { text: 'Grammar Analysis', link: '/features/grammar-analysis' },
            { text: 'Vocabulary Learning', link: '/features/vocabulary-learning' },
          ],
        },
        {
          text: 'Configuration',
          items: [
            { text: 'API Setup', link: '/configuration/api-setup' },
            { text: 'Vocabulary Settings', link: '/configuration/vocabulary-settings' },
            { text: 'Language Settings', link: '/configuration/language-settings' },
          ],
        },
        {
          text: 'Legal',
          items: [{ text: 'Privacy Policy', link: '/privacy-policy' }],
        },
      ],
      '/zh/': [
        {
          text: '快速开始',
          items: [
            { text: '介绍', link: '/zh/' },
            { text: '安装指南', link: '/zh/guide/installation' },
            { text: '快速上手', link: '/zh/guide/quick-start' },
          ],
        },
        {
          text: '功能特性',
          items: [
            { text: '功能概览', link: '/zh/features/' },
            { text: '智能简化', link: '/zh/features/smart-simplification' },
            { text: '语法分析', link: '/zh/features/grammar-analysis' },
            { text: '词汇学习', link: '/zh/features/vocabulary-learning' },
          ],
        },
        {
          text: '配置',
          items: [
            { text: 'API 设置', link: '/zh/configuration/api-setup' },
            { text: '词汇设置', link: '/zh/configuration/vocabulary-settings' },
            { text: '语言设置', link: '/zh/configuration/language-settings' },
          ],
        },
        {
          text: '法律条款',
          items: [{ text: '隐私政策', link: '/zh/privacy-policy' }],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/ChenChenyaqi/flow-reader' }],

    footer: {
      message: 'Released under the AGPL v3.0 License.',
      copyright: 'Copyright © 2026-present FlowReader',
    },

    search: {
      provider: 'local',
    },

    // Chinese locale
    locales: {
      zh: {
        label: '简体中文',
        nav: [
          { text: '指南', link: '/zh/guide/' },
          { text: '功能', link: '/zh/features/' },
          { text: '配置', link: '/zh/configuration/' },
          { text: '隐私政策', link: '/zh/privacy-policy' },
        ],
        footer: {
          message: '基于 AGPL v3.0 许可发布。',
          copyright: 'Copyright © 2026-present FlowReader',
        },
      },
    },
  },

  markdown: {
    theme: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
  },
})
