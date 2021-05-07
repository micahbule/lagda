import { expect } from 'chai'
import 'mocha'
import { useFakeTimers, SinonFakeTimers } from 'sinon'
import Lagda from '../src'
import { VerificationResult, SigningMethodOptions } from '../src/types'

describe('Lagda', () => {
    const someSecuredUrl = 'http://example.com/some-secured-resource-to-be-exposed'
    const defaultSecrets = ['secret1', 'secret2']

    describe('sign', () => {
        describe('should append signature', () => {
            it('without other queries', () => {
                const lagda = new Lagda({
                    secrets: defaultSecrets,
                    ttl: 30,
                })

                const signedUrl = lagda.sign(someSecuredUrl)

                expect(signedUrl).to.contain('?signed=')
            })

            it('with other queries', () => {
                const someSecuredUrlWithQueries = `${someSecuredUrl}?key1=value1&key2=value2`

                const lagda = new Lagda({
                    secrets: defaultSecrets,
                    ttl: 30,
                })

                const signedUrl = lagda.sign(someSecuredUrlWithQueries)

                expect(signedUrl).to.contain('&signed=')
            })
        })
        
        describe('with options', () => {
            it('default ttl')
            it('custom ttl')
            it('expiry')
            it('method')
        })
    })

    describe('verify', () => {
        it('invalid url length')
        it('invalid signature')
        it('invalid signature data')
        it('expired signature', async () => {
            const clock: SinonFakeTimers = useFakeTimers()

            const lagda = new Lagda({
                secrets: defaultSecrets,
                ttl: 30,
            })

            const signedUrl = lagda.sign(someSecuredUrl)

            const [result, signingData]: [VerificationResult, SigningMethodOptions?] = lagda.verify(signedUrl)

            expect(result).to.equal(VerificationResult.ok)
            expect(signingData?.expiry).to.be.greaterThan(Math.ceil(Date.now()/1000))

            clock.tick(31000)

            const [invalidResult] = lagda.verify(signedUrl)
            expect(invalidResult).to.equal(VerificationResult.expired)
            expect(signingData?.expiry).to.be.lessThan(Math.ceil(Date.now()/1000))

            clock.restore()
        })

        it('valid signature', () => {
            const lagda = new Lagda({
                secrets: defaultSecrets,
                ttl: 30,
            })

            const signedUrl = lagda.sign(someSecuredUrl)

            const [result, signingData]: [VerificationResult, SigningMethodOptions?] = lagda.verify(signedUrl)

            expect(result).to.equal(VerificationResult.ok)
            expect(signingData?.expiry).to.be.greaterThan(Math.ceil(Date.now()/1000))
        })
    })
})