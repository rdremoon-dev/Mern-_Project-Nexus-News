const sanitizeHtml = require('sanitize-html');

const sanitizeArticleHtml = (html = '') => {
  return sanitizeHtml(html, {
    allowedTags: [
      'p',
      'br',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'strong',
      'b',
      'em',
      'i',
      's',
      'u',
      'blockquote',
      'ul',
      'ol',
      'li',
      'a',
      'img',
      'pre',
      'code',
      'hr',
    ],

    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height'],
    },

    allowedSchemes: ['https', 'http', 'mailto'],
    allowedSchemesByTag: {
      img: ['https'],
    },

    allowProtocolRelative: false,

    transformTags: {
      a: sanitizeHtml.simpleTransform(
        'a',
        {
          rel: 'noopener noreferrer',
        },
        true,
      ),
    },
  });
};

module.exports = sanitizeArticleHtml;
