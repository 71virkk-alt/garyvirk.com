# Public evidence package

This directory is the publishable evidence boundary for the controlled
network access-control lab. It contains:

- deterministic Batfish evaluation summaries;
- execution input bindings for every Batfish state;
- Packet Tracer screenshots re-encoded without metadata;
- Packet Tracer CLI excerpts and an evidence-to-policy mapping;
- an accessible topology diagram;
- a generated report; and
- a source-provenance record covering the policy, topology, scenarios,
  snapshots, dependency lock, runner, evaluators, validator, builder, and
  tests; and
- a checksum manifest covering every public evidence file.

The private Batfish run roots and original Packet Tracer captures remain
outside this boundary. They contain execution details that are useful for
review but unsuitable for a public repository.

## Claim boundary

Batfish evaluated all 15 policy rows against authored IOS-style configurations.
Packet Tracer manually corroborated three representative rows in a four-VLAN
router-on-a-stick adaptation:

- `ACL-REQ-001`: users can reach the application server over HTTPS;
- `ACL-REQ-006`: admin can reach the application server over ICMP; and
- `ACL-PRO-004`: guests cannot reach the admin subnet.

The two environments use the same synthetic addressing and ACL intent, but
they do not use the same interface topology. Batfish uses four routed physical
interfaces; Packet Tracer uses one 802.1Q trunk with four router subinterfaces.
The Packet Tracer results therefore corroborate representative policy behavior,
not byte-for-byte execution of the Batfish configuration.

Run the public package checks from the repository root:

```bash
python3 src/build_public_release.py --check
```
