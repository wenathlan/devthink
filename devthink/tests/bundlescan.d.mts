/** Strips the non code spans of one bundle so the naming check reads declared identifiers only. */
export declare function stripstrings(content: string): string;
/** Reads the platform names of the bundle targets. */
export declare function platformnames(name: string): string[];
/** Reads the external wire format field names the naming check allowlists beside the platform constants. */
export declare function wireformatnames(name: string): boolean;
/** Reads the maene lineage's wire format config field names the naming check allowlists beside the webextension field names. */
export declare function maeneconfigfields(name: string): boolean;
/** Reads the underscored identifiers of one bundle for the naming check. */
export declare function underscorednames(content: string): string[];
