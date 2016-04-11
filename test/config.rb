###
# Page options, layouts, aliases and proxies
###

# Per-page layout changes:
#
# With no layout
page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false

# With alternative layout
# page "/path/to/file.html", layout: :otherlayout

# Proxy pages (http://middlemanapp.com/basics/dynamic-pages/)
# proxy "/this-page-has-no-template.html", "/template-file.html", locals: {
#  which_fake_page: "Rendering a fake page with a local variable" }

# General configuration

# Reload the browser automatically whenever files change
configure :development do
  activate :livereload
end

###
# Helpers
###

# Methods defined in the helpers block are available in templates
# helpers do
#   def some_helper
#     "Helping"
#   end
# end

# Build-specific configuration
configure :build do
  # Minify CSS on build
  # activate :minify_css

  # Minify Javascript on build
  activate :minify_javascript
end

after_build do |builder|
    nody_source_path = File.expand_path('source/js/nd.js',Dir.pwd)
    nody_build_path  = File.expand_path('build/js/nd.js',Dir.pwd)
    webkit_source_path = File.expand_path('source/js/nd.webkit.js',Dir.pwd)
    webkit_build_path = File.expand_path('build/js/nd.webkit.js',Dir.pwd)
    FileUtils.cp nody_source_path, File.expand_path('../dist/nd.js',Dir.pwd)
    FileUtils.cp nody_build_path, File.expand_path('../dist/nd.min.js',Dir.pwd)
    FileUtils.cp webkit_source_path, File.expand_path('../dist/nd.webkit.js',Dir.pwd)
    FileUtils.cp webkit_build_path, File.expand_path('../dist/nd.webkit.min.js',Dir.pwd)
end
