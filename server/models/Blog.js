const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    website: { type: String, trim: true, default: '' },
    content: { type: String, required: true, trim: true },
    blogTitle: { type: String, default: '' },
    blogSlug: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Health',
        'Sports',
        'Politics',
        'Business',
        'Arts',
        'Science',
        'World',
      ],
    },
    coverImage: { type: String, required: true },
    coverImageFileId: { type: String, default: '' },
    excerpt: { type: String, required: true },
    contentHtml: { type: String, default: '' },
    paragraphs: [{ type: String }],
    pullQuote: { type: String, default: '' },
    author: { type: String, default: 'Editorial Desk' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isFeatured: { type: Boolean, default: false },
    comments: [commentSchema],
  },
  { timestamps: true },
);

blogSchema.pre('validate', function () {
  if (this.title && (!this.slug || this.isModified('title'))) {
    const baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    this.slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
  }
});

module.exports = mongoose.model('Blog', blogSchema);
