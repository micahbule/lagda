import { ParsedUrlQueryInput } from "querystring";

export interface LagdaOptions {
    secrets: string[],
    ttl: number,
}

export interface SigningMethodOptions {
    ttl?: number,
    expiry?: number,
    address?: string,
    method?: string | string[],
}

export interface SigningOptions extends SigningMethodOptions, ParsedUrlQueryInput {
    randomizer: string,
}

export enum VerificationResult {
    ok,
    blackholed,
    expired
}
