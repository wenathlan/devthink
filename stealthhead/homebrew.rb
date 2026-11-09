# wenathlan-stealthhead — the homebrew formula of the family (the homebrew channel).
# The lane stamps the version and sha256 at push time (the sums derive from
# the release tarball assets the release lane builds, never hardcoded).
class WenathlanStealthhead < Formula
  desc "The FPS game platform — only game logics (match, ranking, weapons, world); the versawase and audio engines ride the published library"
  homepage "https://github.com/wenathlan/devthink"
  url "https://github.com/wenathlan/devthink/releases/download/v2.0.167/wenathlan-stealthhead-2.0.167.tgz"
  version "2.0.167"
  # sha256 stamped by the lane from the release asset (never hardcoded)
  sha256 "0000000000000000000000000000000000000000000000000000000000000000"

  depends_on "node"

  def install
    libexec.install Dir["*"]
    (bin/"wenathlan-stealthhead").write <<~SH
      #!/bin/bash
      exec "#{libexec}/cli.js" "$@"
    SH
  end

  test do
    assert_match "2.0.167", shell_output("#{bin}/wenathlan-stealthhead --version")
  end
end
