/** Wraps one cjs bundle body into a umd envelope so script tag consumers receive the global and require consumers receive the module; the 2.0.0 sunset removed the deprecated uppercase global the 1.1.81 library modes shipped as a shim, so the envelope exposes exactly the global the frozen library surface declares. */
export declare function umdwrap(body: string, globalname: string): string;
