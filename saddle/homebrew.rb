# wenathlan-saddle — the homebrew formula of the family (the homebrew channel).
# The lane stamps the version and sha256 at push time (the sums derive from
# the release tarball assets the release lane builds, never hardcoded).
class WenathlanSaddle < Formula
  desc "Binary computing engine that turns distributed storage into a publishable working set, carrying the merged virtual-hardware engine CLI process adapter (explicit local invocations, no shell, no credentials, no host hardware)"
  homepage "https://github.com/wenathlan/saddle"
  url "https://github.com/wenathlan/devthink/releases/download/v2.0.181/wenathlan-saddle-2.0.181.tgz"
  version "2.0.181"
  # sha256 stamped by the lane from the release asset (never hardcoded)
  sha256 "0000000000000000000000000000000000000000000000000000000000000000"

  depends_on "node"

  def install
    libexec.install Dir["*"]
    (bin/"wenathlan-saddle").write <<~SH
      #!/bin/bash
      exec "#{libexec}/cli.js" "$@"
    SH
  end

  test do
    assert_match "2.0.181", shell_output("#{bin}/wenathlan-saddle --version")
  end
end
