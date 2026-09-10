package io.github.wenathlan.devthink;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Builds and starts explicit local DevThink CLI process invocations.
 *
 * <p>The carrier answers the lowercase file name doctrine (the technical name {@code devthink}
 * while the class keeps the presentation name {@code DevThink}); the class drops the public
 * modifier so the java file name rule holds — the envelope carries the version constant the
 * metadata lockstep stamps, the registry lanes never compile it.
 */
final class DevThink {
  /** The version of the merged product (the grand-merge envelope carrier). */
  public static final String VERSION = "2.0.13";
  private DevThink() {
  }

  /** Returns the executable command and supplied arguments without invoking a shell. */
  public static List<String> command(String... arguments) {
    var command = new ArrayList<String>();
    command.add(System.getenv().getOrDefault("DEVTHINK_BIN", "devthink"));
    command.addAll(Arrays.asList(arguments));
    return List.copyOf(command);
  }

  /** Creates a process builder for a user-owned local DevThink binary. */
  public static ProcessBuilder process(String... arguments) {
    return new ProcessBuilder(command(arguments));
  }

  /** Starts a user-owned local DevThink binary with the supplied arguments. */
  public static Process start(String... arguments) throws IOException {
    return process(arguments).start();
  }
}
