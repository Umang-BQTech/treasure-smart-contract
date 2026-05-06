# Treasury & bridge contracts

Upgradeable Solidity contracts used to custody ERC-20 liquidity, orchestrate allowances and fee attribution, expose admin-only controls, and interact with bridging / messaging primitives. **Treasury** is deployed behind a UUPS proxy on **Ultron**; **TreasuryBridge** does the same on **Base**.

## Overview (readable)

This codebase is an on-chain “treasury + integration” layer. A **Treasury** contract holds ERC-20 tokens, can approve a trusted spender ahead of user transactions, restricts who may charge a configurable deposit-style fee tied to NFT-like identifiers (via an allowlist), and lets admins manage parameters and withdrawals. Separately, a **TreasuryBridge** contract collects user deposits into the contract’s token balance, publishes a structured payload through an Akasha-facing bridge stub for cross-system coordination, then allows trusted operators to forward the pooled balance across a generic `IBridge` flow toward a treasury address registered for another chain. Everything is wired for **Hardhat**, **OpenZeppelin Upgradeable**, and scripted deploy/upgrade workflows so engineers can replicate environments (local RPC and public testnets/mainnets).

## Technical architecture

Both **Treasury** and **TreasuryBridge** inherit **BaseUpgradable** (`OwnableUpgradeable` + **`PausableUpgradeable`** + **`UUPSUpgradeable`**) with a dedicated **`adminAddress`** role (`onlyAdmin`: admin or owner) distinct from owner-only **UUPS** upgrades (`_authorizeUpgrade` is `onlyOwner`). Storage layout is forward-compatible via an explicit **`uint256[50]`** gap. **`Treasury`** uses **`SafeERC20`** for withdrawals, **`EnumerableSet`** for allowlisted backends, initializes with **` IERC20(token).approve(spender, type(uint256).max)`**, and computes fees as \((amount \cdot depositFee) / 10^4\) in **`calculateAndUpdateFee`** (allowlisted callers only). **`TreasuryBridge`** wires **`IAkashaBridge.publishMessage`** for event-style payloads **`abi.encodePacked(payloadId, padded holder word, amount, nftId)`** and batches liquidity into **`IBridge.deposit(destinationChainId, resourceId, data)`**, where **`data`** is **`abi.encodePacked(amount, abi.encodePacked(treasuryAddress).length, treasuryAddress)`** for handler-side decoding. Local development uses **Hardhat 2.x**, **Solidity 0.8.24** (compiler) with **`optimizer runs: 200`**, **`@openzeppelin/hardhat-upgrades`** for deterministic proxy deployment, **`solhint` / Prettier** for style, and **`test/`** mocks plus **ethers v6 static calls** around fee math and deposit/bridge sequencing.

---

## Deployed proxies (verification)

### Ultron mainnet — Treasury

- Proxy: [0xA7Bb966A815B79f5e0a07062dDd2D68aDCD63440](https://blockscout.ultron-cloud.net/address/0xA7Bb966A815B79f5e0a07062dDd2D68aDCD63440)

### Ultron testnet — Treasury

- Proxy: [0xd703361ec5bd2ac51637d5C54e8539baA65D44F6](https://blockscout.ultron-cloud.dev/address/0xd703361ec5bd2ac51637d5C54e8539baA65D44F6)

### Base mainnet — TreasuryBridge

- Proxy: [0x3890381679580FE92Cd5fB7Cb1eFA3655D931B66](https://basescan.org/address/0x3890381679580FE92Cd5fB7Cb1eFA3655D931B66)

### Base Sepolia — TreasuryBridge

- Proxy: [0x47Cf906d98f205f2fd74469f428013de164EA424](https://sepolia.basescan.org/address/0x47Cf906d98f205f2fd74469f428013de164EA424#code)

---

## Development

```bash
cp .env.example .env   # optional for local tests; required for live networks
yarn install           # or npm install
yarn test              # Hardhat + OpenZeppelin upgrades smoke tests
yarn solhint
```

- **`OWNER_KEY`** is only needed for `testnet_ulx`, `ulx`, `base`, or `sepolia_base` RPC sends. Hardhat’s in-process network does not require it.
- Admin flows like `yarn hardhat approve-tokens --network <name> --contract <proxy> --token <erc20> --approveAddress <spender>` must be executed with a wallet that is **`admin` / `owner`** on the proxy.

---

## Layout

| Path | Role |
| --- | --- |
| `contracts/Treasury.sol` | Fee-aware treasury + ERC-20 approvals |
| `contracts/TreasuryBridge.sol` | Deposits, Akasha payloads, GenericChain-style bridge calls |
| `contracts/base/BaseUpgradable.sol` | Admin/owner pause + UUPS template |
| `contracts/mocks/*.sol` | Local test doubles only |
| `scripts/` | Deploy + upgrade helpers |
| `tasks/` | Hardhat CLI tasks for operational tuning |

---

## Security note

These contracts grant significant power to **`owner` / `admin`** and to **allowlisted operators** (unlimited ERC-20 approvals, bridge pushes, fee calculation hooks). Review trust assumptions, run `yarn test`, and perform independent audits before handling material TVL.
