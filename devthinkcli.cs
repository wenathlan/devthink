using System.Diagnostics;

namespace DevThink;

/// <summary>
/// Builds and starts explicit local DevThink CLI process invocations.
/// The carrier answers the lowercase file name doctrine (the technical name devthinkcli while
/// the class keeps the presentation name DevThinkCli) — the envelope carries the version
/// constant the metadata lockstep stamps, the nupkg lane never compiles it.
/// </summary>
public static class DevThinkCli
{
    /// <summary>The version of the merged product (the grand-merge envelope carrier).</summary>
    public const string Version = "2.0.18";

    /// <summary>Returns a process start configuration without involving a shell.</summary>
    public static ProcessStartInfo StartInfo(params string[] arguments)
    {
        var executable = Environment.GetEnvironmentVariable("DEVTHINK_BIN") ?? "devthink";
        var startInfo = new ProcessStartInfo(executable)
        {
            UseShellExecute = false,
        };

        foreach (var argument in arguments)
        {
            startInfo.ArgumentList.Add(argument);
        }

        return startInfo;
    }

    /// <summary>Starts a user-owned local DevThink binary with the supplied arguments.</summary>
    public static Process Start(params string[] arguments)
    {
        return Process.Start(StartInfo(arguments)) ?? throw new InvalidOperationException("DevThink could not be started.");
    }
}
