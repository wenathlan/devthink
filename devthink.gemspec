Gem::Specification.new do |spec|
  spec.name = "devthink"
  spec.version = ENV.fetch("DEVTHINK_VERSION", "1.1.15")
  spec.authors = ["wenathlan"]
  spec.email = ["support@users.noreply.github.com"]
  spec.summary = "Ruby process adapter for the DevThink CLI."
  spec.description = "Builds explicit local DevThink CLI invocations without storing provider credentials."
  spec.homepage = "https://github.com/wenathlan/devthink"
  spec.license = "MIT"
  spec.required_ruby_version = ">= 3.1"
  spec.files = ["README.md", "runner/devthink.rb"]
  spec.require_paths = ["runner"]
  spec.metadata["source_code_uri"] = "https://github.com/wenathlan/devthink"
  spec.metadata["homepage_uri"] = spec.homepage
end
