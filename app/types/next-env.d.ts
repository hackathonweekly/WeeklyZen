/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.

declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: 'development' | 'production' | 'test'
        NEXT_PUBLIC_APP_URL?: string
        NEXT_PUBLIC_WECHAT_APP_ID?: string
        WECHAT_APP_ID?: string
        WECHAT_APP_SECRET?: string
    }
} 