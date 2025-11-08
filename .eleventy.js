module.exports = function(eleventyConfig) {
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

  // Create posts collection from posts directory
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("posts/*.md").reverse();
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
