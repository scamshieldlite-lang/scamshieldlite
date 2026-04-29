export declare const auth: import("better-auth").Auth<{
    database: (options: import("better-auth").BetterAuthOptions) => import("better-auth").DBAdapter<import("better-auth").BetterAuthOptions>;
    secret: string;
    baseURL: string;
    trustedOrigins: string[];
    plugins: [{
        id: "bearer";
        version: string;
        hooks: {
            before: {
                matcher(context: import("better-auth").HookEndpointContext): boolean;
                handler: (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<{
                    context: {
                        headers: Headers;
                    };
                } | undefined>;
            }[];
            after: {
                matcher(context: import("better-auth").HookEndpointContext): true;
                handler: (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<void>;
            }[];
        };
        options: import("better-auth/plugins").BearerOptions | undefined;
    }];
    session: {
        expiresIn: number;
        updateAge: number;
        cookieCache: {
            enabled: true;
            maxAge: number;
        };
    };
    emailAndPassword: {
        enabled: true;
        minPasswordLength: number;
        requireEmailVerification: false;
        autoSignIn: false;
    };
    onAPIError: {
        onError: (error: unknown, ctx: import("better-auth").AuthContext) => void;
    };
    hooks: {
        after: (inputContext: import("better-auth").MiddlewareInputContext<import("better-auth").MiddlewareOptions>) => Promise<void>;
    };
    advanced: {
        useSecureCookies: boolean;
        disableCheckOrigin: boolean;
    };
}>;
//# sourceMappingURL=auth.d.ts.map