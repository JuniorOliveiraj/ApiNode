const router = require("express").Router();

const blog = require('../controller/blog/addBlog');
const tag = require('../controller/blog/BlogTags');

router.get('/adicionar', blog.addBlog);
router.get('/list', blog.ListBlog);
router.get('/read', blog.readBlog);
router.get('/list/tags', tag.ListTags)

module.exports = router;