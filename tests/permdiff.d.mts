/** Reads the permission set of one manifest in its declared order with its set tags, so the diff logic tests import the gate module with its types. */
export declare function permissionsetof(manifest: { permissions?: string[]; optional_permissions?: string[]; optional_host_permissions?: string[] }): { required: string[]; optional: string[]; optionalhost: string[]; entries: string[] };
/** Resolves the previous release version of one semver string. */
export declare function previousof(version: string): string;
/** Reports every added, removed and reordered permission between two resolved permission sets. */
export declare function diffpermissionsets(current: { required: string[]; optional: string[]; optionalhost: string[]; entries: string[] }, previous: { required: string[]; optional: string[]; optionalhost: string[]; entries: string[] }): { added: string[]; removed: string[]; reordered: string[] };
