# CLAUDE.md addendum — UI Patterns layer

> Append this section to the existing `CLAUDE.md` in the repo root. Do not replace existing rules.

---

## UI Patterns (docs/patterns/)

The DS now has a pattern layer above components. Rules:

1. **Compose, don't invent.** Any screen/section request is resolved by composing patterns from `docs/patterns/README.md`. If a needed block has no spec, flag it as `UNMAPPED` in the pre-write — never improvise structure.
2. **Pattern IDs are the vocabulary.** Requests use IDs (`DASH-SIDEBAR`, `APP-TABLE`) or plain names that map to one. State the resolved Figma node-id in the pre-write.
3. **Slots are the contract.** Content fills a pattern's slots as defined in its spec. Restructuring a block's anatomy requires updating the spec first.
4. **Tickets follow `docs/patterns/REQUESTING-UI.md`.** Omitted ticket fields → DS defaults, assumptions stated in the pre-write.
5. **Specs win over memory.** When generating a pattern that has a spec, read the spec — tokens, variants and composition rules come from there, not from training data or prior chats.
6. **Status discipline.** When a pattern lands in code, update its spec (`Code status`, `Code path`) and the tracker in `docs/patterns/README.md` in the same commit.
