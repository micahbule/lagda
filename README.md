# Lagda

A simple library to generate pre-signed URLs for sharing secured resources for a definite time period

## Installation

`$ npm i -s lagda`

## Example

```js
const assert = require('assert')
const Lagda = require('lagda')
const someSecureResource = 'http://example.com/secure-file.pdf'

const lagda = new Lagda({
    secrets: ['secret1', 'secret2'],
    ttl: 30, // seconds from creation to expire
})

// Signing
const signedUrl = lagda.sign(someSecureResource)

// Verification
const [result, signatureData] = lagda.verify(signedUrl)

assert(result).equal(result, 0) // true
```

## API

### new Lagda({ secrets, ttl })
* **secrets** - is an array of secrets that can be rotated. Internally, Lagda uses [Keygrip](https://github.com/crypto-utils/keygrip) to sign the URL using Keygrip's default signing algorithm. See Keygrip's [.sign()](https://github.com/crypto-utils/keygrip#keyssigndata) method for details.
* **ttl** - is the expiry time in seconds.

### lagda.sign(url, { options })
* **url** - is the URL you want to sign
* **options** - TO-DO

### lagda.verify(signedUrl)
* **signedUrl** - is the signed URL produced by `lagda.sign()`