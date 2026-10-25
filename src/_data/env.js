module.exports = {
  isProd: process.env.GITHUB_ACTIONS === 'true' || process.env.ELEVENTY_ENV === 'production'
};