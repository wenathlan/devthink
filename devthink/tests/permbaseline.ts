/** The versioned permission baseline of the permdiff gate as one dense typescript module: the recorded permission set of the release it stamps, the diff it answered against, its justification rows and the permission set hash the audit trail records. The container builds and the fresh checkouts carry no git history, so this checked-in baseline stays the source the gate trusts; the sync mode of tests/permdiff.ts rewrites this module after the justification review, and the readiness review reads it for the permission diff verdict. */

/** The permission baseline the gate records: the release it stamps, the previous release it diffed against, the source that resolved the comparison, the added, removed and reordered entries with their justification rows, the clean verdict and the permission set hash. */
export interface permdiffbaseline {
  release: string;
  previous: string;
  source: string;
  added: string[];
  removed: string[];
  reordered: string[];
  justified: Array<{ entry: string; row: string }>;
  unjustified: string[];
  clean: boolean;
  permissionhash: string;
  permissionset: { required: string[]; optional: string[]; optionalhost: string[] };
}

/** The recorded baseline of the 2.0.152 release — clean over 2.0.151, zero added, zero removed, zero reordered. */
export const permdiffbaseline: permdiffbaseline = {
  "release": "2.0.152",
  "previous": "2.0.151",
  "source": "the versioned baseline of the previous release",
  "added": [],
  "removed": [],
  "reordered": [],
  "justified": [],
  "unjustified": [],
  "clean": true,
  "permissionhash": "1d6e1579114bf176eba45a159e9f166c9c4a2587a53644bd2a63f880506a6262",
  "permissionset": {
    "required": [
      "required:activeTab",
      "required:storage",
      "required:scripting",
      "required:sidePanel"
    ],
    "optional": [
      "optional:tabs",
      "optional:downloads",
      "optional:clipboardRead",
      "optional:clipboardWrite",
      "optional:offscreen",
      "optional:nativeMessaging"
    ],
    "optionalhost": [
      "optionalhost:https://*/*"
    ]
  }
};
