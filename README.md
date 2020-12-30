# Ethereum 2.0 Lighthouse validator node

## Very Important Note

If you are not sure that the running validator client is down and will not recover, please don't setup a new one with the same validator keys.

If more than 1 validator client with the same keys are online, they may attest or propose contradicting blocks, triggering slashing condition, which leads to serious punishment and validator being banned forever.

For example, if the VPS node is unaccessible, you need to remove the whole VPS node from the VPS control panel before setting up a new one.

If the VPS is under maintainence, do not setup a new node, since the VPS service provider may restart your old node after maintainence.

(Running a backup beacon node is OK but it consumes both disk resource and Ethereum 1.0 endpoint query quota quite much)

## System Requirement

All requirements are from the data of first month (Dec 2020) with some redundancy.

As number of validators increase, the requirements may also increase.

 - 2 core CPU
 - 4 GB memory
 - 2 GB disk space per month 
 - 120 GB network traffic (both direction, i.e. 120 GB in & 120 GB out) per month

## Setup



1. setup Docker and Docker Compose
2. create lighthouse data directory: `mkdir .lighthouse`
3. check https://github.com/sigp/lighthouse/releases and https://hub.docker.com/r/sigp/lighthouse/tags and update `docker-compose.yml` for the latest stable version of lighthouse
4. modify `docker-compose.yml` and `rate-limiter/config.js` for Ethereum 1.0 endpoints
5. If you are setting up for the first time from launchpad (instead of recovering a node), you may simply follow the launchpad instruction for importing the key instead of using the mnemonic words.

Otherwise, import validator keys from mnemonic words: `docker run -it --rm -v $PWD/.lighthouse:/root/.lighthouse sigp/lighthouse:v1.0.5 lighthouse account_manager validator recover` (modify the image version in the command according to step 3)

6. test if the validator keys are enabled: `docker run -it --rm -v $PWD/.lighthouse:/root/.lighthouse sigp/lighthouse:v1.0.5 lighthouse account_manager validator list` (modify the image version in the command according to step 3), should see output like this: 

```
Running account manager for mainnet network
validator-dir path: "/root/.lighthouse/mainnet/validators"
0x123412341234123412341234123412341234123412341234123412341234123412341234123412341234123412341234 (enabled)
```

7. `docker-compose up -d` to start both the beacon node, validator client and rate limiter
8. check firewall to forward port 9000 (both TCP and UDP)

## About the rate limiter

The rate limiter is for limiting the frequency of Ethereum 1.0 endpoint queries. Most 3rd party providers (e.g. Alchemy, Infura) have quota on number of free queries.

The rate limiter limits the query rate by holding the response until a certain deadline (e.g. 10s), so the queries will be more or less limited by the rate of 10s per query.

Note that lighthouse has a timeout value for Ethereum 1.0 queries of ~15s (please check the source code), so the deadline should not be set to too long. In practice, 10s deadline limits the computation units consumption to < 5M per month on Alchemy, where the free quota is 10M per month.

## Monitoring

One may manually check the node status from https://beaconcha.in/. For example, https://beaconcha.in/validator/123412341234123412341234123412341234123412341234123412341234123412341234123412341234123412341234#attestations to check the attestation records of validator `0x123412341234123412341234123412341234123412341234123412341234123412341234123412341234123412341234`.

The node supports Prometheus metrics, which could be enabled by `--metrics` (together with `--metrics-address 0.0.0.0`) from the beacon node cmdline parameter.
