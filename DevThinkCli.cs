using System.Diagnostics;

namespace DevThink;

/// <summary>Builds and starts explicit local DevThink CLI process invocations.</summary>
public static class DevThinkCli
{
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
