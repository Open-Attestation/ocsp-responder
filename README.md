# OCSP Responder for OpenAttestation (Reference Implementation)

A simple reference implementation of an OCSP (Online Certificate Status Protocol) Responder to assist in revocation of [OpenAttestation](https://www.openattestation.com) documents.

The verification library ([oa-verify](https://www.npmjs.com/package/@govtechsg/oa-verify)) is then used to check the revocation status of an issued/signed document.

## Prerequisites

Rename .env.example to .env

To start revoking documents via an OCSP Responder, ensure that the revocation `type` and `location` has been populated with the following values:

- `revocation.type` : `OCSP_RESPONDER`
- `revocation.location`: `https://your-ocsp-responder.example.com`

More information can be found here: https://www.openattestation.com/docs/integrator-section/verifiable-document/did/revoking-document-ocsp/

<details>
  <summary><b>Example DID-issued document with OCSP revocation</b>:</summary>
  
```json
{
  "version": "https://schema.openattestation.com/2.0/schema.json",
  "data": {
    "id": "d80edf08-859e-451c-9a67-67541fc18ea1:string:779879ba-7a9a-4091-995a-4865dec6e71b",
    "issuers": [
      {
        "id": "8079bda7-a7fd-4b57-a980-991b6622b8c9:string:did:ethr:0xE39479928Cc4EfFE50774488780B9f616bd4B830",
        "name": "bfeefd13-f867-474a-a3fa-c14c3886c65e:string:Demo Issuer",
        "revocation": {
          "type": "a68ba1ab-9811-4f13-b3a0-49957f6c03b5:string:OCSP_RESPONDER",
          "location": "ae1afda9-3a38-4f5b-8416-66380f20e13e:string:https://ocsp-sandbox.openattestation.com"
        },
        "identityProof": {
          "type": "44687ce4-65c8-41c9-a383-b81d5ccf8f80:string:DNS-DID",
          "location": "cd67e8b1-a67f-4cd0-bce7-6c4366cb0d29:string:donotverify.testing.verify.gov.sg",
          "key": "98bebe8e-f626-4378-9bdf-74a6f325b821:string:did:ethr:0xE39479928Cc4EfFE50774488780B9f616bd4B830#controller"
        }
      }
    ],
    "$template": {
      "name": "f5a45dca-ff5d-48e5-b96e-8fbb2b9062e6:string:CERTIFICATE_OF_NON_MANIPULATION",
      "type": "90eb64a9-ce10-4bef-9c23-861f9cabaca3:string:EMBEDDED_RENDERER",
      "url": "e8fceddd-65dc-4fc0-a9e9-7d47c7e39074:string:https://demo-cnm.openattestation.com"
    }
  },
  "signature": {
    "type": "SHA3MerkleProof",
    "targetHash": "13e53a698cd616a4df6781d6e61ce851c06ffe27db11b4bbcc7e7b4f76935a53",
    "proof": [],
    "merkleRoot": "13e53a698cd616a4df6781d6e61ce851c06ffe27db11b4bbcc7e7b4f76935a53"
  },
  "proof": [
    {
      "type": "OpenAttestationSignature2018",
      "created": "2022-05-20T07:45:04.076Z",
      "proofPurpose": "assertionMethod",
      "verificationMethod": "did:ethr:0xE39479928Cc4EfFE50774488780B9f616bd4B830#controller",
      "signature": "0x233b3d03446aa56a55c091f9a1062cbd3277c8814dfff722773773bb9b034bb0051ef4c16c387ed4f2e200849b6b14229aebe0effed8ec0933d809ca99af593a1c"
    }
  ]
}
```

</details>

## Getting started

### Run a local instance

```bash
npm i
npm run dev
```

### Revoking a document

Insert an entry to the revocation table:

<table>
<tbody>
  <tr>
    <td><b>Path</b></td>
    <td><code>/</code></td>
  </tr>
  <tr>
    <td><b>Request Type</b></td>
    <td><code>POST</code></td>
  </tr>
  <tr>
    <td><b>Request Body</b></td>
    <td>
    <pre><code>{
  "documentHash": "0x13e53a698cd616a4df6781d6e61ce851c06ffe27db11b4bbcc7e7b4f76935a53",
  "reasonCode": 3
}</code></pre></td>
  </tr>
  <tr>
    <td><b>Response Body</b></td>
    <td><pre><code>{
  "success": true,
  "documentHash": "0x13e53a698cd616a4df6781d6e61ce851c06ffe27db11b4bbcc7e7b4f76935a53",
  "message": "documentHash inserted into revocation table"
}</code></pre></td>
  </tr>
</tbody>
</table>

### Checking document status

Query for an entry in the revocation table:

<table>
<tbody>
  <tr>
    <td><b>Path</b></td>
    <td><code>/{documentHash}</code></td>
  </tr>
  <tr>
    <td><b>Request Type</b></td>
    <td><code>GET</code></td>
  </tr>
  <tr>
    <td><b>Response Body</b></td>
    <td><pre><code>{
  "revoked": true,
  "documentHash": "0x13e53a698cd616a4df6781d6e61ce851c06ffe27db11b4bbcc7e7b4f76935a53",
  "reasonCode": 3
}</code></pre></td>
  </tr>
</tbody>
</table>

### Undo revocation

Remove an entry from the revocation table:

<table>
<tbody>
  <tr>
    <td><b>Path</b></td>
    <td><code>/{documentHash}</code></td>
  </tr>
  <tr>
    <td><b>Request Type</b></td>
    <td><code>DELETE</code></td>
  </tr>
  <tr>
    <td><b>Response Body</b></td>
    <td><pre><code>{
  "success": true,
  "documentHash": "0x13e53a698cd616a4df6781d6e61ce851c06ffe27db11b4bbcc7e7b4f76935a53",
  "message": "documentHash removed from revocation table"
}</code></pre></td>
  </tr>
</tbody>
</table>

## API

### `reasonCode`

| Reason               | Code |
| -------------------- | ---- |
| unspecified          | 0    |
| keyCompromise        | 1    |
| caCompromise         | 2    |
| affiliationChanged   | 3    |
| superseded           | 4    |
| cessationOfOperation | 5    |
| certificateHold      | 6    |
| NOT USED             | 7    |
| removeFromCRL        | 8    |
| privilegeWithdrawn   | 9    |
| aACompromise         | 10   |

> **_NOTE:_** The code number 7 is not used
