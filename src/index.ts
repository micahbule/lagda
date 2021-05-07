import querystring from 'querystring'
import Keygrip from 'keygrip'
import { LagdaOptions, SigningMethodOptions, SigningOptions, VerificationResult } from './types'

class Lagda {
    private secrets: string[]

    private ttl: number

    private PAIR_DELIMITER = ';'

    private KEY_VALUE_DELIMITER = ':'

    private SIGNATURE_LENGTH = 27

    private SIGNATURE_DATA_IDENTIFIER = 'signed'

    constructor(options: LagdaOptions) {
        const { secrets, ttl } = options
        this.secrets = Array.isArray(secrets) ? secrets : [secrets]
        this.ttl = ttl
    }

    private getTtlExpiry(timeToLapse?: number) {
        return Math.ceil(+new Date()/1000) + (timeToLapse || this.ttl)
    }

    private parseSignatureOptions(signatureData: string): SigningMethodOptions {
        return querystring.parse(signatureData, this.PAIR_DELIMITER, this.KEY_VALUE_DELIMITER)
    }

    sign(url: string, options?: SigningMethodOptions): string {
        const opts: SigningOptions = {
            ...options,
            randomizer: Math.floor(Math.random() * 10000000000).toString()
        }

        const expiry = (opts.ttl ? this.getTtlExpiry(opts.ttl) : null) || opts.expiry || (this.ttl ? this.getTtlExpiry() : null)

        if (expiry) {
            opts.expiry = expiry
        }

        if (opts.method) {
            opts.method = (Array.isArray(opts.method) ? opts.method.join(',') : opts.method).toUpperCase()
        }

        
        const signatureData = querystring.stringify(opts, this.PAIR_DELIMITER, this.KEY_VALUE_DELIMITER)
        const signatureSuffix = url.indexOf('?') === -1 ? '?' : '&'
        let signedUrl = `${url}${signatureSuffix}${this.SIGNATURE_DATA_IDENTIFIER}=${encodeURIComponent(signatureData)}${encodeURIComponent(this.PAIR_DELIMITER)}`

        const keys = Keygrip(this.secrets)
        const signature = keys.sign(signedUrl)

        signedUrl = `${signedUrl}${signature}`

        return signedUrl
    }

    verify(url: string): [VerificationResult, SigningMethodOptions?] {
        if (url.length < this.SIGNATURE_LENGTH + 1) return [VerificationResult.blackholed]

        const signedUrl = url.substring(0, url.length - this.SIGNATURE_LENGTH)
        const signature = url.substr(-this.SIGNATURE_LENGTH)

        const validSignature = Keygrip(this.secrets).verify(signedUrl, signature)

        if (!validSignature) return [VerificationResult.blackholed]

        let signatureDataPosition = url.lastIndexOf(`&${this.SIGNATURE_DATA_IDENTIFIER}=`)

        if(signatureDataPosition === -1) {
            signatureDataPosition = url.lastIndexOf(`?${this.SIGNATURE_DATA_IDENTIFIER}=`)
        }

        if (signatureDataPosition === -1) return [VerificationResult.blackholed]

        const signatureStrStart = signatureDataPosition + (this.SIGNATURE_DATA_IDENTIFIER.length + 2)
        const signatureStrEnd = url.length - (this.SIGNATURE_LENGTH + 3)
        const signatureData = decodeURIComponent(url.substring(signatureStrStart, signatureStrEnd))

        const opts = this.parseSignatureOptions(signatureData)
        opts.expiry = Number(opts.expiry)

        if (opts.expiry && opts.expiry < Math.ceil(+new Date()/1000)) {
            return [VerificationResult.expired]
        }

        return [VerificationResult.ok, opts]
    }
}

export default Lagda
