export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: 'WeeklyZen | 周周冥想',
  description: '周周冥想是周周黑客松社区下的一个专注纯粹冥想练习的温暖小组，致力于为创客和开发者提供一个简单、可持续的冥想空间。',
  mainNav: [
    {
      title: '首页',
      titleEn: 'Home',
      href: '/',
    },
    {
      title: '开始冥想',
      titleEn: 'Start Meditation',
      href: '/meditation',
    },
    {
      title: '冥想入门',
      titleEn: 'Introduction',
      href: '/introduction',
    },
    {
      title: '关于我们',
      titleEn: 'About Us',
      href: '/about',
    },
  ],
  links: {
    github: 'https://github.com/weeklyzen',
    docs: 'https://weeklyzen.club',
  },
}
