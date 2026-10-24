# Compact identity contract

New DevThink records use lowercase URL-safe IDs with a semantic prefix, one underscore and a 10-character base32 token. Each new ID is 12–14 characters long. Existing longer IDs remain readable so local stores can migrate gradually.

| Record | Prefix | Example | Created by |
|---|---|---|---|
| User | `u` | `u_7q0m4p2d8k` | Local identity |
| Device | `d` | `d_4z1m8q7c2h` | Local identity |
| Workspace | `w` | `w_6k3n9e1r5v` | Session store |
| Session | `s` | `s_2d8q6m4p7k` | Session store |
| Tab | `t` | `t_9v1c5r3h8m` | Session store |
| Message | `m` | `m_5e2k7q9d1r` | Session store |
| Pairing | `p` | `p_8m4c1v6q2d` | Pairing store |
| Browser session | `bs` | `bs_3r7k2m8q4v` | Pairing store |

The identifier is an opaque local reference, not a password, provider credential or durable remote account token.
