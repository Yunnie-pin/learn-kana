// The Japanese fonts used to be excluded from the service worker precache because of their size.
// They are subset to the app's characters now (npm run fonts, ~2 MB in total), so they are
// precached like every other asset and handwritten fonts work offline too.
module.exports = {};
