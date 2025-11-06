module.exports = function(eleventyConfig) {
  // passthrough copy for assets directory
  eleventyConfig.addPassthroughCopy("assets");

  // Add small helper filter to render current year in templates
  eleventyConfig.addFilter("year", function() {
    return new Date().getFullYear();
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
