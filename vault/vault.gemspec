Gem::Specification.new do |spec|
  spec.name = "vault"
  spec.version = ENV.fetch("VAULT_VERSION", "2.0.182")
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

  # the lost-dependency recovery union (the additive mirror law)
  spec.add_dependency "aws-sdk-s3", ">= 1.242.0"
  spec.add_dependency "daytona_api_client", ">= 1.0.0"
  spec.add_dependency "daytona_toolbox_api_client", ">= 0.231.1"
  spec.add_dependency "dotenv", ">= 3.2.0"
  spec.add_dependency "observer", ">= 0.1.2"
  spec.add_dependency "opentelemetry-exporter-otlp", ">= 0.37.0"
  spec.add_dependency "opentelemetry-exporter-otlp-metrics", ">= 0.15.0"
  spec.add_dependency "opentelemetry-metrics-sdk", ">= 0.22.0"
  spec.add_dependency "opentelemetry-sdk", ">= 1.13.1"
  spec.add_dependency "toml", ">= 0.3.0"
  spec.add_dependency "websocket-client-simple", ">= 0.9.0"
end
