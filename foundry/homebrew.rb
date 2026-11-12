# wenathlan-foundry — the homebrew formula of the family (the homebrew channel).
# The lane stamps the version and sha256 at push time (the sums derive from
# the release tarball assets the release lane builds, never hardcoded).
class WenathlanFoundry < Formula
  desc "The e2b and docker clone interface — sandboxes and images while the engine lives in saddle"
  homepage "https://github.com/wenathlan/devthink"
  url "https://github.com/wenathlan/devthink/releases/download/v2.0.181/wenathlan-foundry-2.0.181.tgz"
  version "2.0.181"
  # sha256 stamped by the lane from the release asset (never hardcoded)
  sha256 "0000000000000000000000000000000000000000000000000000000000000000"

  depends_on "node"

  def install
    libexec.install Dir["*"]
    (bin/"wenathlan-foundry").write <<~SH
      #!/bin/bash
      exec "#{libexec}/cli.js" "$@"
    SH
  end

  test do
    assert_match "2.0.181", shell_output("#{bin}/wenathlan-foundry --version")
  end
end
