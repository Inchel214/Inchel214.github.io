module.exports = function(eleventyConfig) {
  // passthrough copy for assets directory
  eleventyConfig.addPassthroughCopy("assets");

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
