# Network Access-Control Validation Report

Status: **Independent review candidate**

## Result

The controlled change produced the declared HTTPS regression, the correction restored the baseline, and the rollback file is byte-identical to the untouched baseline.

## Automated modeled reachability

| State | Rows evaluated | Gate |
| --- | ---: | --- |
| baseline | 15 | Pass |
| broken | 15 | Pass |
| corrected | 15 | Pass |
| rollback | 15 | Pass |
| baseline-repeat | 15 | Pass |

Baseline coverage: 6 required, 5 prohibited, and 4 unaffected flows.

The broken state changed only `ACL-REQ-001` from `DELIVERED_TO_SUBNET` to `DENIED_IN`. Corrected, rollback, and clean baseline-repeat observations match the baseline.

## Packet Tracer corroboration

| State | Policy | Evidence | Result |
| --- | --- | --- | --- |
| baseline | `ACL-REQ-001` | HTTPS page returned | pass |
| broken | `ACL-REQ-001` | Request Timeout; deny rule recorded 12 matches | expected_failure_observed |
| corrected | `ACL-REQ-001` | HTTPS page returned; permit rule recorded 6 matches | pass |
| rollback | `ACL-REQ-001` | HTTPS page returned | pass |
| rollback | `ACL-REQ-006` | 4 sent, 4 received, 0 percent loss | pass |
| rollback | `ACL-PRO-004` | 4 sent, 0 received; GUESTS_IN deny recorded 4 matches | pass |

## Evidence boundary

Packet Tracer manually corroborates three representative policy rows. The remaining 12 rows are Batfish-modeled only.

The Packet Tracer router-on-a-stick topology is an adaptation of the four-physical-interface Batfish topology. Addressing and ACL intent agree; interface structure and application points are not byte-identical.

See `packet-tracer/evidence-record.json`, `packet-tracer/cli-transcript.md`, `batfish/input-bindings.json`, `source-provenance.json`, and `release-manifest.json` for the evidence map and checksums.
