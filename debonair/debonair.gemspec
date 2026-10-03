Gem::Specification.new do |spec|
  spec.name = "debonair"
  spec.version = ENV.fetch("DEBONAIR_VERSION", "2.0.78")
  spec.authors = ["wenathlan"]
  spec.email = ["support@users.noreply.github.com"]
  spec.summary = "The debonair documentation, site and tests envelope (the katexis engine home)."
  spec.description = "Distributes the debonair documentation set, the zero-build site and the tests directory as one Ruby gem. debonair is the audio and DAW app; it houses the katexis engine at the folder root."
  spec.homepage = "https://github.com/wenathlan/devthink"
  spec.license = "GPL-3.0-only"
  spec.required_ruby_version = ">= 3.1"
  spec.files = Dir["README.md", "docs/**/*", "site/**/*", "tests/**/*"]
  spec.metadata["source_code_uri"] = "https://github.com/wenathlan/devthink"
  spec.metadata["homepage_uri"] = spec.homepage
end
