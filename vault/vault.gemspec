Gem::Specification.new do |spec|
  spec.name = "vault"
  spec.version = ENV.fetch("VAULT_VERSION", "2.0.176")
  spec.authors = ["wenathlan"]
  spec.email = ["support@users.noreply.github.com"]
  spec.summary = "The vault documentation and tests envelope (the supabase clone — the self-hosted database, auth and storage surface)."
  spec.description = "Distributes the vault documentation set and the tests directory as one Ruby gem. vault is the supabase clone — the self-hosted database, auth and storage surface."
  spec.homepage = "https://github.com/wenathlan/devthink"
  spec.license = "GPL-3.0-only"
  spec.required_ruby_version = ">= 3.1"
  spec.files = Dir["README.md", "docs/**/*", "test/**/*"]
  spec.metadata["source_code_uri"] = "https://github.com/wenathlan/devthink"
  spec.metadata["homepage_uri"] = spec.homepage
end
