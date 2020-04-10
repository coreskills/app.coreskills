module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    process.env.NODE_ENV === 'production' && require('@fullhuman/postcss-purgecss')({
      content: [
        './layouts/main.ejs',
      ],
      defaultExtractor: content => content.match(/[\w-/.:]+(?<!:)/g) || []
    })
  ]
}