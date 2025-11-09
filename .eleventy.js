module.exports = function(eleventyConfig) {
  const fs = require('fs');
  // passthrough copy for assets directory
  eleventyConfig.addPassthroughCopy("assets");

  // Add small helper filter to render current year in templates
  eleventyConfig.addFilter("year", function() {
    return new Date().getFullYear();
  });

  // Add a simple date filter used by feed/sitemap templates
  eleventyConfig.addFilter("date", function(dateObj, format) {
    if(!dateObj) return '';
    const d = (dateObj instanceof Date) ? dateObj : new Date(dateObj);
    if(!format) return d.toISOString();
    // RFC-1123 for RSS pubDate
    if(format.indexOf('DDD') !== -1 || format.indexOf('dd') !== -1 || format.indexOf('HH') !== -1) {
      return d.toUTCString();
    }
    // YYYY-MM-DD
    if(format.indexOf('yyyy') !== -1) {
      return d.toISOString().slice(0,10);
    }
    return d.toISOString();
  });

  // Beijing time formatter: outputs in Asia/Shanghai timezone
  eleventyConfig.addFilter("dateLocal", function(dateObj, format) {
    if(!dateObj) return '';
    const d = (dateObj instanceof Date) ? dateObj : new Date(dateObj);
    const pad = n => String(n).padStart(2, '0');
    // Use Intl to get parts in Asia/Shanghai
    const parts = new Intl.DateTimeFormat('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    }).formatToParts(d).reduce((acc, p) => (acc[p.type] = p.value, acc), {});
    const yyyy = parts.year;
    const mm = parts.month;
    const dd = parts.day;
    const HH = parts.hour;
    const min = parts.minute;
    const ss = parts.second;

    if(!format || format === 'yyyy-LL-dd') {
      return `${yyyy}-${mm}-${dd}`;
    }
    if(format === 'yyyy-LL-dd HH:mm') {
      return `${yyyy}-${mm}-${dd} ${HH}:${min}`;
    }
    if(format === 'yyyy-LL-dd HH:mm:ss') {
      return `${yyyy}-${mm}-${dd} ${HH}:${min}:${ss}`;
    }
    // Fallback ISO-like date in Asia/Shanghai
    return `${yyyy}-${mm}-${dd} ${HH}:${min}:${ss}`;
  });

  // Add XML escape filter for feed
  eleventyConfig.addFilter("xmlEscape", function(str) {
    if(!str) return '';
    return str.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  });

  // Read file's last modified time (Date) by input path
  eleventyConfig.addFilter("fileUpdated", function(inputPath) {
    if(!inputPath) return '';
    try {
      const stat = fs.statSync(inputPath);
      return stat.mtime;
    } catch(e) {
      return '';
    }
  });

  // Create posts collection from posts directory
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("posts/*.md")
      .map(item => {
        try {
          const stat = fs.statSync(item.inputPath);
          item.data.updated = stat.mtime;
        } catch(e) {
          // ignore fs error
        }
        return item;
      })
      .reverse();
  });

  // Create tags collection
  eleventyConfig.addCollection("tagList", function(collectionApi) {
    const tags = new Set();
    collectionApi.getAll().forEach(function(item) {
      if (item.data.tags) {
        item.data.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  });

  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      layouts: "_includes/layouts",
      output: "public"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    passthroughFileCopy: true
  };
};
