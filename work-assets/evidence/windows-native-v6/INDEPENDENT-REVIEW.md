# Project 1 native Windows v6 independent review

## Verdict

- Private native execution: **APPROVED**
- Public technical publication: **APPROVED WITH STATED SCOPE**

The native Windows run does not need to be repeated. Its private evidence and
the exact sanitized release candidate are closed, internally consistent,
source-bound, reproducible, and technically sufficient for the two approved
scenarios.

## Private-run verification

Reviewed package:

`evidence/runs/native-windows-v6`

Source:

- revision: `b768787cbffe2b43786119e97db6a4befb605dbd`
- source-manifest SHA-256:
  `0680fa174f00881730f1c50b3a7058e77273556c2811aba57392e64324e7c8b4`

Verified:

- all 2,544 private-manifest members exist;
- the private file tree is exactly closed by the manifest;
- every recorded byte count and SHA-256 hash matches;
- the source manifest equals the source-revision binding;
- every source member matches both the current clean revision and the exact
  file at revision `b768787`;
- all 1,232 command-ledger rows are contiguous;
- every command exited zero and no command timed out;
- exactly four Windows starts used `--disposable`;
- exactly four graceful Windows shutdowns completed;
- all four Windows session-isolation records are present;
- all four initialization records validate the exact healthy IPv4 state;
- all 12 captured stages have exact marker identities and closed three-file
  payload sets;
- every marker payload byte count and SHA-256 hash matches;
- every stage passed the exact public-IP, Mac-bridge IPv4, and public-DNS
  negative-control validator;
- every collection-attempt log passed its bounded retry validator;
- DNS-only failed as `Fail / DNSOnly`;
- wrong-static-network failed as `Fail / NetworkPath`;
- all healthy, corrected, and rollback stages passed as `Pass / Healthy`;
- both fresh disposable rollback-pre-init captures prove their scenario fault
  was absent;
- no adapter-enabled-state fault or adapter-down artifact exists in the v6
  package;
- the final command ledger proves the Windows VM and all blocked private VM
  UUIDs were stopped;
- current live state independently confirms Windows stopped, Alpine started,
  and all blocked private VMs stopped.

## Retry disclosure

Both rollback captures needed two collection attempts:

1. attempt one retained `PingException`,
   `Unknown / EvidenceUnavailable`;
2. attempt two completed and returned `Pass / Healthy`.

No completed failure was retried. The direct commands, DNS control, TCP
control, final collector evidence, and all negative controls agree with the
final Healthy result. These retries must remain visible in any public package.

## Public release-candidate verification

Reviewed candidate:

`release-candidate/native-windows-v6`

Bindings:

- native evidence revision:
  `b768787cbffe2b43786119e97db6a4befb605dbd`;
- export-tool revision:
  `5a8dc7c4655e510583c024a2c9dc686acd1bac8e`;
- export-tool combined SHA-256:
  `04686fdd28584b7c05af6a872b68555d67e52d40dfb39ccdb796bcdb0e08edc0`;
- public checksum-manifest SHA-256:
  `a8de4716768f4fa576a4f550255fe4b720b098efa550819ab3a002d580d020e9`.

Verified:

- the candidate contains exactly 24 payload artifacts plus its external
  checksum manifest;
- the manifest closes the payload tree exactly;
- every public byte count and SHA-256 hash matches;
- independent manifest verification returns `manifest_valid: true`;
- a fresh independent export is byte-identical to the candidate;
- all 10 public stages exactly equal the reviewed recursive sanitization of
  their hash-bound private evidence;
- every public transcript exactly equals the reviewed sanitization of its
  private transcript;
- structured collection-attempt logs and negative-control outcomes are
  retained;
- the two rollback `PingException` retries remain visible;
- the exporter and release-gate members both match revision `5a8dc7c`;
- the exporter source manifest and combined hash are present in the public
  validation record;
- the scanner reports 24 of 24 artifacts with no issues, including additional
  deny-term checks for owner and local-account identifiers;
- independent residual searches found no VM UUID, adapter MAC, host-network
  UUID, local user path, owner name, lab hostname, link-local IPv6 identifier,
  Mac bridge address, globally scoped IPv4 value, adapter-down reference, or
  secret pattern;
- only loopback, broadcast, and RFC 5737 documentation IPv4 values remain;
- 44 Python tests, 47 Pester tests, parser checks, compilation, and diff checks
  pass.

## Publication scope and wording

Approval is limited to the exact candidate and checksum manifest above.

Public copy may claim:

- native Windows 11 ARM64 execution;
- two repeatable healthy baselines;
- a reproduced and corrected DNS-only fault;
- a reproduced and corrected wrong-static-network fault;
- fresh disposable-session rollback;
- selected public-IP, public-DNS, and Mac-bridge IPv4 negative controls;
- hash-bound, privacy-reviewed evidence.

Public copy must not claim:

- complete isolation from every possible Mac host address;
- that no collection retry occurred;
- an adapter-down native scenario;
- screenshot or video evidence that is not in this text-first package.

The candidate intentionally records `publication_approved: false` because that
field was written before this independent review. Publish this review beside
the immutable candidate. Do not edit the candidate in place; any payload
change requires a new manifest and another review.
