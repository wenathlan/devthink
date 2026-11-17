# wenathlan-getry — the homebrew formula of the family (the homebrew channel).
# The lane stamps the version and sha256 at push time (the sums derive from
# the release tarball assets the release lane builds, never hardcoded).
class WenathlanGetry < Formula
  desc "The AI gateway — five provider gateways serving 70 registered route lanes (14 route kinds per version — the seven chat core kinds plus the seven media lanes)"
  homepage "https://github.com/wenathlan/devthink"
  url "https://github.com/wenathlan/devthink/releases/download/v2.0.185/wenathlan-getry-2.0.185.tgz"
  version "2.0.185"
  # sha256 stamped by the lane from the release asset (never hardcoded)
  sha256 "0000000000000000000000000000000000000000000000000000000000000000"

  depends_on "node"

  def install
    libexec.install Dir["*"]
    (bin/"wenathlan-getry").write <<~SH
      #!/bin/bash
      exec "#{libexec}/cli.js" "$@"
    SH
  end

  test do
    assert_match "2.0.185", shell_output("#{bin}/wenathlan-getry --version")
  end
end
