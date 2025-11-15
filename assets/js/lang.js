(() => {
  const dict = {
    zh: {
      brand: "Inchel Lee",
      nav_home: "首页",
      nav_projects: "项目",
      nav_posts: "文章",
      nav_about: "关于",
      nav_contact: "联系我",
      back_home: "← 返回首页",
      hero_title: "技术 · 思考 · 实践",
      hero_lead: "记录项目、分享后端与工程实践中的知识与思考。专注于AI应用开发，助力职业成长与技术落地。欢迎阅读、反馈与讨论。",
      cta_latest: "查看最新文章",
      sec_posts: "最新文章",
      updated_label: "更新于：",
      read_more: "阅读全文 →",
      about_title: "关于我",
      about_intro: "你好，我是 Inchel Lee，2020 年从广东工业大学硕士毕业，是一名 AI 应用与后端系统的开发者。毕业至今一直致力于将视频 AI 技术在会议办公场景下的商用与落地。这里记录着我过往的参与过的项目与思考。我目标是想参与更有商业价值的项目，用 AI 技术解决真实世界的问题。",
      sec_projects: "项目",
      sec_contact: "联系我",
      contact_intro: "如果你对我的项目感兴趣，或者希望与我合作，请通过以下方式联系我",
      label_email: "邮箱：",
      label_github: "GitHub：",
      sec_tags: "标签",
      tags_view_all: "查看全部标签 →",
      tags_empty: "暂无标签。",
      tags_all: "所有标签",
      posts_word: "篇",
      tags_back_index: "← 返回标签索引",
      tag_no_posts: "暂时没有包含该标签的文章。",
      tags_search_label: "搜索标签",
      tags_search_placeholder: "搜索标签…",
      tags_search_empty: "没有匹配的标签。"
    },
    en: {
      brand: "Inchel Lee",
      nav_home: "Home",
      nav_projects: "Projects",
      nav_posts: "Posts",
      nav_about: "About",
      nav_contact: "Contact",
      back_home: "← Back Home",
      hero_title: "Technology · Thinking · Practice",
      hero_lead: "Sharing backend and engineering practices. Focus on AI app development to support career growth and practical delivery.",
      cta_latest: "View Latest Posts",
      sec_posts: "Latest Posts",
      updated_label: "Updated: ",
      read_more: "Read More →",
      about_title: "About Me",
      about_intro: "Hi, I'm Inchel Lee. I graduated with a master's from Guangdong University of Technology in 2020, and I work on AI applications and backend systems. Since then I've focused on bringing video AI into meeting and office scenarios in production. Here I record the projects I've participated in and my thoughts. My goal is to work on more commercially valuable projects, using AI to solve real-world problems.",
      sec_projects: "Projects",
      sec_contact: "Contact",
      contact_intro: "If you're interested in my projects or want to collaborate, please reach me via:",
      label_email: "Email: ",
      label_github: "GitHub: ",
      sec_tags: "Tags",
      tags_view_all: "Browse all tags →",
      tags_empty: "No tags yet.",
      tags_all: "All Tags",
      posts_word: "posts",
      tags_back_index: "← Back to Tags Index",
      tag_no_posts: "No posts under this tag yet.",
      tags_search_label: "Search tags",
      tags_search_placeholder: "Search tags…",
      tags_search_empty: "No matching tags."
    }
  };

  const preferred = localStorage.getItem('lang');
  const defaultLang = preferred || (document.documentElement.lang && document.documentElement.lang.startsWith('zh') ? 'zh' : 'en');

  function apply(lang) {
    const t = dict[lang] || dict.zh;
    document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      const val = t[key];
      if (val == null) return;
      if (el.tagName === 'INPUT' && (el.type === 'button' || el.type === 'submit')) {
        el.value = val;
      } else {
        // Allow simple HTML (e.g., <br>) in translations for better formatting
        el.innerHTML = val;
      }
    });
    // Apply placeholder i18n for inputs
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = t[key];
      if (val != null) {
        el.setAttribute('placeholder', val);
      }
    });
    // Toggle bilingual segments in Markdown-rendered content
    document.querySelectorAll('[data-lang]').forEach(el => {
      const show = el.getAttribute('data-lang') === lang;
      el.style.display = show ? '' : 'none';
    });
    const toggle = document.getElementById('lang-toggle');
    if (toggle) {
      toggle.textContent = lang === 'zh' ? 'EN' : '中文';
      toggle.setAttribute('aria-label', lang === 'zh' ? '切换到英文' : 'Switch to Chinese');
    }
  }

  function setLang(lang) {
    localStorage.setItem('lang', lang);
    apply(lang);
  }

  document.addEventListener('DOMContentLoaded', () => {
    apply(defaultLang);
    const toggle = document.getElementById('lang-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const current = localStorage.getItem('lang') || defaultLang;
        const next = current === 'zh' ? 'en' : 'zh';
        setLang(next);
      });
    }
  });
})();