module.exports = {
  plugins: {
    'tailwindcss': {},
    'autoprefixer': {},
    ...(process.env.NODE_ENV === 'production' ? {
      'cssnano': {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          // Disable SVG optimization for better performance
          svgo: false,
        }],
      }
    } : {})
  },
};
