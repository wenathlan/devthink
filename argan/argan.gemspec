Gem::Specification.new do |spec|
  spec.name = "argan"
  spec.version = ENV.fetch("ARGAN_VERSION", "2.0.87")
  spec.authors = ["wenathlan"]
  spec.email = ["support@users.noreply.github.com"]
  spec.summary = "The argan documentation, site and tests envelope (the DNS and gateway library)."
  spec.description = "Distributes the argan documentation set, the zero-build site and the tests directory as one Ruby gem. argan is the DNS and gateway library — zones, records, dnssec and handshake."
  spec.homepage = "https://github.com/wenathlan/devthink"
  spec.license = "GPL-3.0-only"
  spec.required_ruby_version = ">= 3.1"
  spec.files = Dir["README.md", "docs/**/*", "site/**/*", "tests/**/*"]
  spec.metadata["source_code_uri"] = "https://github.com/wenathlan/devthink"
  spec.metadata["homepage_uri"] = spec.homepage
end
