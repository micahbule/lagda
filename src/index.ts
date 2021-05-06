import { LagdaOptions } from './types'

class Lagda {
    private secrets: string[]

    private ttl: number

    constructor(options: LagdaOptions) {
        const { secrets, ttl } = options
        this.secrets = Array.isArray(secrets) ? secrets : [secrets]
        this.ttl = ttl
    }
}

export default Lagda
