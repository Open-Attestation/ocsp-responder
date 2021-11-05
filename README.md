# OCSP Responder for OA (Reference Implementation)

## About

This application was intended to be a simple reference implementation for an OCSP responder which would be used with [Open Attestation](https://www.npmjs.com/package/@govtechsg/open-attestation) and [OA Verify](https://www.npmjs.com/package/@govtechsg/oa-verify) in order to check the revocation status of a document issued and signed using [Decentralized Identifiers](https://www.openattestation.com/docs/appendix/glossary#did)(DIDs).

After deployment, the URL of the OCSP responder should be added in the `issuers.revocation` section of a document that could be potentially be revoked.

### Sample Raw Document

```
{
  "version": "https://schema.openattestation.com/2.0/schema.json",
  "data": {
    "id": "SGCNM21566327",
    "$template": {
      "name": "CERTIFICATE_OF_NON_MANIPULATION",
      "type": "EMBEDDED_RENDERER",
      "url": "https://demo-cnm.openattestation.com"
    },
    "issuers": [
      {
        "id": "did:ethr:0xE712878f6E8d5d4F9e87E10DA604F9cB564C9a89",
        "name": "Demo Issuer",
        "revocation": {
          "type": "OCSP_RESPONDER",
          "location": "https://www.ica.gov.sg/ocsp"
        },
        "identityProof": {
          "type": "DNS-DID",
          "location": "example.tradetrust.io",
          "key": "did:ethr:0xE712878f6E8d5d4F9e87E10DA604F9cB564C9a89#controller"
        }
      }
    ]
  }
}
```

When the document is to be revoked, an entry is added to the database of the OCSP Responder application.

---

## API

### Inserting an entry

`POST /`

Make a `POST` request with the certificate identifier and revocation reason code

Sample request body:

```
{
    "certificateId": "SGCNM21566327",
    "reasonCode": "4"
}
```

Sample response:

```
OK
```

### Querying certificate status

`GET /:certificateId`

Make a `GET` request with the certificate identifier

Sample response:

```
{
    "certificateStatus": "revoked",
    "reasonCode": "4"
}
```

## Deleting an entry

`DELETE /:certificateId`

Make a `DELETE` request with the certificate identifier

Sample response:

```
OK
```
