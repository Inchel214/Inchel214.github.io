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
