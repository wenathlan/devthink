Gem::Specification.new do |spec|
  spec.name = "pulse"
  spec.version = ENV.fetch("PULSE_VERSION", "2.0.187")
  spec.authors = ["wenathlan"]
  spec.email = ["support@users.noreply.github.com"]
  spec.summary = "The pulse documentation and tests envelope (the voice-first social studio — 24/7 social automation and channel management of X, Instagram, Facebook and YouTube)."
  spec.description = "Distributes the pulse documentation set and the tests directory as one Ruby gem. pulse is the voice-first social studio of the wenathlan family, the twelfth module — the open studio for 24/7 social automation and channel management (X, Instagram through the official Graph API, Facebook, YouTube), operable by humans and agent swarms on the family VMs."
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
