# CALPQ FV-02 Implementation Contract

Status: `PLANNING ONLY / BLOCKED`

FV-02 defines only the Core `Clock` and `IdGenerator` ports and deterministic test substitutes. Core receives time and identifiers through these ports. No provider, UI, persistence, transport, credential, eligibility or authorization behavior belongs in this package.

The implementation must reuse FV-01 UTC instant and typed-ID semantics. Direct wall-clock and global ID generation inside deterministic Core rules are forbidden. Concrete adapters remain outside Core.

Completion requires implementation and tests together plus green dependency and project guards.