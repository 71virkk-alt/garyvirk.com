# Packet Tracer CLI evidence excerpts

These excerpts were captured from the Packet Tracer 9 accessibility output
during the controlled run. Long boot banners, the simulated device serial
number, and unrelated command history are omitted. Column spacing is normalized
where Packet Tracer concatenated fields in its accessibility output. The
accompanying screenshots show the same decisive commands and results.

## Baseline interface and ACL direction

```text
edge-r1-pt#show ip interface GigabitEthernet0/0/0.10
GigabitEthernet0/0/0.10 is up, line protocol is up (connected)
  Internet address is 10.20.10.1/24
  Outgoing access list is not set
  Inbound  access list is USERS_IN
```

## Controlled failure injection and observed counter

```text
edge-r1-pt#configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
edge-r1-pt(config)#ip access-list extended USERS_IN
edge-r1-pt(config-ext-nacl)#5 deny tcp 10.20.10.0 0.0.0.255 host 10.20.30.80 eq 443
edge-r1-pt(config-ext-nacl)#end
edge-r1-pt#show access-lists USERS_IN
Extended IP access list USERS_IN
    deny tcp 10.20.10.0 0.0.0.255 host 10.20.30.80 eq 443 (12 match(es))
    permit tcp 10.20.10.0 0.0.0.255 host 10.20.30.80 eq 443
    permit udp 10.20.10.0 0.0.0.255 host 10.20.30.53 eq domain
    permit tcp 10.20.10.0 0.0.0.255 host 10.20.30.53 eq domain
    permit tcp 10.20.10.0 0.0.0.255 host 10.20.30.90 eq 445
    deny tcp 10.20.10.0 0.0.0.255 10.20.20.0 0.0.0.255 eq 3389
    deny tcp 10.20.10.0 0.0.0.255 10.20.30.0 0.0.0.255 eq 22
    permit ip any any
```

The user workstation returned `Request Timeout` for
`https://10.20.30.80` while this rule was present.

## Correction and restored permit counter

```text
edge-r1-pt#configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
edge-r1-pt(config)#ip access-list extended USERS_IN
edge-r1-pt(config-ext-nacl)#no 5
edge-r1-pt(config-ext-nacl)#end
edge-r1-pt#show access-lists USERS_IN
Extended IP access list USERS_IN
    permit tcp 10.20.10.0 0.0.0.255 host 10.20.30.80 eq 443 (6 match(es))
    permit udp 10.20.10.0 0.0.0.255 host 10.20.30.53 eq domain
    permit tcp 10.20.10.0 0.0.0.255 host 10.20.30.53 eq domain
    permit tcp 10.20.10.0 0.0.0.255 host 10.20.30.90 eq 445
    deny tcp 10.20.10.0 0.0.0.255 10.20.20.0 0.0.0.255 eq 3389
    deny tcp 10.20.10.0 0.0.0.255 10.20.30.0 0.0.0.255 eq 22
    permit ip any any
```

The same workstation loaded the Packet Tracer HTTPS page after the rule was
removed.

## Clean rollback reopen

```text
edge-r1-pt#show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0/0   unassigned      YES unset  up                    up
GigabitEthernet0/0/0.10 10.20.10.1     YES manual up                    up
GigabitEthernet0/0/0.20 10.20.20.1     YES manual up                    up
GigabitEthernet0/0/0.30 10.20.30.1     YES manual up                    up
GigabitEthernet0/0/0.40 10.20.40.1     YES manual up                    up
```

The rollback file is byte-identical to the untouched baseline. After reopening
it and waiting for the router to finish booting:

```text
C:\>ping 10.20.30.80
Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)

C:\>ping 10.20.20.10
Reply from 10.20.40.1: Destination host unreachable.
Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)
```

The router tied the guest denial to the inbound ACL:

```text
edge-r1-pt#show ip interface GigabitEthernet0/0/0.40
GigabitEthernet0/0/0.40 is up, line protocol is up (connected)
  Internet address is 10.20.40.1/24
  Outgoing access list is not set
  Inbound  access list is GUESTS_IN

edge-r1-pt#show access-lists GUESTS_IN
Extended IP access list GUESTS_IN
    permit tcp 10.20.40.0 0.0.0.255 host 10.20.30.80 eq 443
    deny ip 10.20.40.0 0.0.0.255 10.20.20.0 0.0.0.255 (4 match(es))
    deny tcp 10.20.40.0 0.0.0.255 10.20.30.0 0.0.0.255 eq 22
    deny tcp 10.20.40.0 0.0.0.255 host 10.20.30.90 eq 445
    permit ip any any
```

## Startup timing note

The first request immediately after reopening the rollback file timed out while
the simulated router was still at `Press RETURN to get started!`. That attempt
is not counted as a policy result. The clean rerun was performed only after all
four subinterfaces reported `up/up`.
