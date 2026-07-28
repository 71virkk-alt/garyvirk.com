# Sanitization record

The public package is derived from hash-verified private Windows artifacts. Collection timestamps are omitted by construction. The allowlist keeps classifier inputs, control results, bounded provenance, and command transcripts.

Native evidence revision: `b768787cbffe2b43786119e97db6a4befb605dbd`  
Export-tool revision: `5a8dc7c4655e510583c024a2c9dc686acd1bac8e`  
Export-tool combined SHA-256: `04686fdd28584b7c05af6a872b68555d67e52d40dfb39ccdb796bcdb0e08edc0`  
Tool `native-lab/export_public.py` SHA-256: `b7e56c4267ceb9cef13e9ab3cd5c83c936e33d28e226b435120da7b9b3745d74`  
Tool `tools/evidence_release.py` SHA-256: `98f5263fb58e808e9648b25e659a703a8a19e11dc96131709b594131f24bc297`  

Transformations observed:

- Mac host bridge addresses: 1
- Mac host bridge addresses: 2
- lab hostnames: 7
- lab identifiers: 3
- link-local IPv6 addresses: 1
- link-local IPv6 addresses: 2
- public IPv4 addresses: 1
- public IPv4 addresses: 4

Excluded: VM identifiers, adapter addresses, account paths, lab hostnames, link-local IPv6 identifiers, Mac bridge probe addresses, process identifiers, raw host configuration, and runtime logs. Structured retry and negative-control outcomes remain present after identifier redaction.
