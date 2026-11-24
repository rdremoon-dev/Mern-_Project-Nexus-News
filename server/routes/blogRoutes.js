// server/routes/blogRoutes.js
const express = require('express');
const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');
const sanitizeArticleHtml = require('../utils/sanitizeHtml');

const router = express.Router();

const stripHtmlToText = (html = '') =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// GET /api/blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json({ blogs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/blogs/recent - Latest posts for user dashboard alerts
router.get('/recent', async (req, res) => {
  try {
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title slug category createdAt');
    res.json({ blogs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/blogs/admin/comments - Admin: All comments across all posts
router.get('/admin/comments', protect, authorizeAdmin, async (req, res) => {
  try {
    const blogs = await Blog.find().select('title slug category comments');
    const allComments = [];

    blogs.forEach(b => {
      (b.comments || []).forEach(c => {
        allComments.push({
          _id: c._id,
          blogId: b._id,
          blogTitle: b.title,
          blogSlug: b.slug,
          category: b.category,
          name: c.name,
          email: c.email,
          website: c.website,
          content: c.content,
          createdAt: c.createdAt,
          isRead: c.isRead ?? false,
        });
      });
    });

    allComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ comments: allComments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/blogs/:blogId/comments/:commentId/read - Admin: Update comment read state
router.patch(
  '/:blogId/comments/:commentId/read',
  protect,
  authorizeAdmin,
  async (req, res) => {
    try {
      if (typeof req.body.isRead !== 'boolean') {
        return res.status(400).json({ message: 'isRead must be a boolean' });
      }

      const blog = await Blog.findById(req.params.blogId);
      if (!blog) return res.status(404).json({ message: 'Blog not found' });

      const comment = blog.comments.id(req.params.commentId);
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      comment.isRead = req.body.isRead;
      await blog.save();

      const commentReadState = {
        blogId: blog._id,
        commentId: comment._id,
        isRead: comment.isRead,
      };
      const io = req.app.get('io');
      if (io) io.to('public').emit('comment_read_state_changed', commentReadState);

      res.json({ comment: commentReadState });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// DELETE /api/blogs/:blogId/comments/:commentId - Admin: Delete a comment
router.delete(
  '/:blogId/comments/:commentId',
  protect,
  authorizeAdmin,
  async (req, res) => {
    try {
      const blog = await Blog.findById(req.params.blogId);
      if (!blog) return res.status(404).json({ message: 'Blog not found' });

      blog.comments = blog.comments.filter(
        c => c._id.toString() !== req.params.commentId,
      );
      await blog.save();
      res.json({ message: 'Comment deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// GET /api/blogs/:slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const query = mongoose.Types.ObjectId.isValid(slug)
      ? { $or: [{ slug }, { _id: slug }] }
      : { slug };

    const blog = await Blog.findOne(query);
    if (!blog) return res.status(404).json({ message: 'Article not found' });

    const prevBlog = await Blog.findOne({ createdAt: { $lt: blog.createdAt } })
      .sort({ createdAt: -1 })
      .select('title slug');

    const nextBlog = await Blog.findOne({ createdAt: { $gt: blog.createdAt } })
      .sort({ createdAt: 1 })
      .select('title slug');

    const mustRead = await Blog.find({
      category: blog.category,
      _id: { $ne: blog._id },
    })
      .sort({ createdAt: -1 })
      .limit(2)
      .select('title slug category coverImage createdAt');

    res.json({ blog, prevBlog, nextBlog, mustRead });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/blogs - Admin create post + real-time notification to users
router.post('/', protect, authorizeAdmin, async (req, res) => {
  try {
    const {
      title,
      category,
      coverImage,
      coverImageFileId,
      excerpt,
      contentHtml,
      pullQuote,
      author,
      isFeatured,
    } = req.body;

    const plainText = stripHtmlToText(contentHtml);
    const paragraphs = plainText ? [plainText] : [];

    const featuredBool = Boolean(isFeatured);
    if (featuredBool) {
      await Blog.updateMany({ isFeatured: true }, { isFeatured: false });
    }

    const blog = await Blog.create({
      title,
      category,
      coverImage,
      coverImageFileId: coverImageFileId || '',
      excerpt: excerpt || plainText.slice(0, 180) || title,
      contentHtml: sanitizeArticleHtml(contentHtml || ''),
      paragraphs,
      pullQuote: pullQuote || '',
      author: author || req.user.name || 'Editorial Desk',
      createdBy: req.user._id,
      isFeatured: featuredBool,
    });

    const io = req.app.get('io');
    if (io) {
      io.to('public').emit('new_post_published', {
        id: blog._id,
        title: blog.title,
        slug: blog.slug,
        category: blog.category,
        createdAt: blog.createdAt,
      });
    }

    res.status(201).json({ blog });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/blogs/:id - Admin update post
router.put('/:id', protect, authorizeAdmin, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Article not found' });

    const {
      title,
      category,
      coverImage,
      coverImageFileId,
      excerpt,
      contentHtml,
      pullQuote,
      author,
      isFeatured,
    } = req.body;

    if (title !== undefined) blog.title = title;
    if (category !== undefined) blog.category = category;
    if (coverImage !== undefined) blog.coverImage = coverImage;
    if (coverImageFileId !== undefined)
      blog.coverImageFileId = coverImageFileId;
    if (excerpt !== undefined) blog.excerpt = excerpt;
    if (pullQuote !== undefined) blog.pullQuote = pullQuote;
    if (author !== undefined) blog.author = author;

    if (contentHtml !== undefined) {
      blog.contentHtml = sanitizeArticleHtml(contentHtml);
      const plainText = stripHtmlToText(contentHtml);
      blog.paragraphs = plainText ? [plainText] : [];
    }

    if (isFeatured !== undefined) {
      const featuredBool = Boolean(isFeatured);
      if (featuredBool) {
        await Blog.updateMany(
          { _id: { $ne: blog._id } },
          { isFeatured: false },
        );
      }
      blog.isFeatured = featuredBool;
    }

    const updated = await blog.save();
    res.json({ blog: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/blogs/:id - Admin delete post
router.delete('/:id', protect, authorizeAdmin, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Article not found' });
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/blogs/:id/comments - Add comment + real-time notification to admin
router.post('/:id/comments', async (req, res) => {
  try {
    const { name, email, website, content, userId } = req.body;
    if (!name?.trim() || !email?.trim() || !content?.trim()) {
      return res.status(400).json({
        message: 'Name, email, and comment content are required.',
      });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ message: 'A valid email is required.' });
    }
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Article not found' });

    const commentDoc = {
      userId: userId || null,
      name: name.trim(),
      email: email.trim(),
      website: website?.trim() || '',
      content: content.trim(),
      blogTitle: blog.title,
      blogSlug: blog.slug,
    };

    blog.comments.unshift(commentDoc);
    await blog.save();

    const createdComment = blog.comments[0];
    const io = req.app.get('io');
    if (io) {
      io.to('admins').emit('new_comment_posted', {
        _id: createdComment._id,
        blogId: blog._id,
        blogTitle: blog.title,
        blogSlug: blog.slug,
        name: createdComment.name,
        email: createdComment.email,
        content: createdComment.content,
        createdAt: createdComment.createdAt,
        isRead: createdComment.isRead,
      });
    }

    res.status(201).json({ comment: createdComment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
