---
name: code-forge
description: "Generate implementation code from an approved design blueprint or verbal requirements. Composes context anchoring, clean architecture, clean code, DDD, security, and test quality into an inside-out implementation workflow. Use when moving from design to code, implementing approved contracts, or when the user says 'implement', 'code this', 'build it', 'forge the code', or 'generate the code'."
---

# Code Forge

## Required Skills

Read and apply these skills:

1. `framework:knowledge-priming` -- Load project context (tech stack, architecture, conventions) so implementation matches the real project (always)
2. `framework:context-anchoring` -- Load or discover an existing context anchor document; enrich it as implementation decisions are made (always)
3. `framework:clean-architecture` -- Layer placement, dependency direction, command/query flow classification (always)
4. `framework:clean-code` -- Code craft guardrails: SRP, naming, complexity, error handling (always)
5. `framework:domain-driven-design` -- Aggregates, entities, value objects, domain services (conditional: only when touching domain folder)
6. `framework:secure-coding` -- Trust boundaries, injection prevention, secrets management (conditional: only for boundary-crossing code)
7. `framework:test-quality` -- AAA structure, isolation, assertion quality, naming (always when writing tests)

## Workflow

### Step 1: Establish Implementation Context

Use `framework:context-anchoring` Document Discovery to check for an existing context anchor document for the feature being implemented.

- **If found** → Load it (context-anchoring Load behavior). Present the structured acknowledgment -- feature name, decision count, open questions, constraints. Honor all logged decisions and constraints as active commitments.
- **If not found** → Nudge the user: "Do you have a design document or blueprint for this feature? Or should I work from what we've discussed?" Accept either answer gracefully.
  - If the user provides a document → load and follow it.
  - If proceeding without → all atom guardrails still apply; there is simply no structured blueprint to reference. Work from the verbal requirements in the conversation.

<!-- AI reasoning: Context anchoring is not a gate -- it is a boost. A blueprint gives us component lists, layer assignments, contracts, and constraints to follow precisely. Without one, we rely on the atoms' self-validation checks to maintain quality. Either path produces good code; the blueprint path produces *aligned* code. -->

### Step 2: Plan Implementation Order

**With blueprint**: Extract the component list and layer assignments from the context anchor document. Use Level 2 (Components) decisions for layer placement and Level 3 (Interactions) for dependency flow.

**Without blueprint**: Classify the required components into architectural layers using `framework:clean-architecture` and these heuristics:

- **Does it enforce business rules or hold domain state?** → Domain layer (entity, value object, domain service)
- **Does it persist or retrieve data?** → Infrastructure layer. State-changing persistence → Repository (with domain interface). Read-only retrieval → Provider (concrete, no domain interface).
- **Does it orchestrate a use case by coordinating domain + infrastructure?** → Application layer (service)
- **Does it translate external input/output (HTTP, CLI, messages)?** → Interface layer (controller/handler)

Present the proposed layer assignments to the user for approval before proceeding.

In both cases, plan an **inside-out implementation order** that follows the dependency rule:

1. **Domain** -- entities, value objects, domain services, domain events
2. **Infrastructure** -- repositories, external providers, adapters
3. **Application** -- use cases, application services, orchestrators
4. **Interface** -- HTTP controllers, CLI handlers, message consumers

Classify each operation as a **command flow** (state-changing, flows through domain before reaching repositories) or a **query flow** (read-only, may use providers directly), per `framework:clean-architecture` Two Flows.

Present the implementation plan -- ordered component list, layer assignments, flow classifications -- and confirm with the user before writing any code.

After the plan is approved, ask the user to choose a **review mode**:

> "How would you like to review the implementation?"
> 1. **Layer-by-layer** (recommended) -- I'll implement each layer fully, then pause for your review before starting the next. Four review points.
> 2. **Full autonomy** -- I'll implement everything end-to-end and present the complete result. One review point at the end.
> 3. **Component-by-component** -- I'll pause after each individual component for your feedback. Maximum review points.

Default to **layer-by-layer** if the user does not express a preference. If a blueprint exists and the user chose full autonomy, still pause on any deviation from the approved design.

<!-- AI reasoning: Inside-out order means each component's dependencies already exist when we build it. Domain has no dependencies. Infrastructure depends only on domain interfaces. Application depends on both. Interface depends on application. This eliminates forward references and lets us test each component in isolation as we go. Letting the user choose pacing respects their context -- a well-understood feature with a trusted blueprint warrants full autonomy; an exploratory feature in an unfamiliar codebase warrants component-by-component. -->

### Step 3: Implement Per Component

For each component in the planned order, generate **code and tests together** -- tests are not an afterthought.

For every component:

- **Place in the correct architectural layer** per `framework:clean-architecture`. Validate dependency direction -- dependencies point inward, never outward.
- **Apply `framework:clean-code` self-validation** during generation. Run the inline checks: SRP compliance, meaningful naming, low cyclomatic complexity, proper error handling, no magic values, clean function signatures, no dead code, appropriate abstraction level, clear control flow, minimal comments (code should be self-documenting).
- **Write tests** using `framework:test-quality` self-validation. Verify: AAA structure, one behavior per test, meaningful assertion messages, test isolation, descriptive test names, no test interdependencies, appropriate use of mocks vs real implementations.

Conditional checks applied per component:

- **If domain layer** → Apply `framework:domain-driven-design` self-validation. Verify: aggregate boundaries enforced, entities have identity, value objects are immutable, domain logic stays in domain, repositories are interface-only in domain, domain events for cross-aggregate communication.
- **If trust boundary** (HTTP handler, external API call, user input processing, file I/O) → Apply `framework:secure-coding` self-validation. Verify: input validation at boundary, parameterized queries, no hardcoded secrets, output encoding, authentication/authorization checks, secure defaults, error messages that don't leak internals, dependency on trusted libraries.
- **If blueprint exists** → Verify the component fulfills its Level 4 (Contracts) specification. Flag any deviation from the agreed contract.

**Pacing -- follow the user's chosen review mode**:

- **Layer-by-layer**: Implement all components within a layer, then present the full layer (code + tests) for review before moving to the next layer.
- **Full autonomy**: Implement all layers continuously. Present the complete implementation (all code + all tests) at the end. Skip to Step 4 (Cross-Component Verification) after all components are done.
- **Component-by-component**: Present each component with its tests individually. Wait for approval before moving to the next.
- **Exception (all modes)**: If a component requires a significant deviation from the plan (new dependency, changed contract, unexpected complexity), pause immediately and discuss before continuing -- regardless of the chosen review mode.

<!-- AI reasoning: Code + tests together means we validate behavior immediately. The conditional atom checks avoid applying DDD overhead to a simple controller or security checks to pure domain logic. Each component gets exactly the guardrails it needs based on what it is and where it lives. The review mode choice lets the user calibrate oversight to their confidence level -- this is not a one-size-fits-all workflow. -->

### Step 4: Cross-Component Verification

After all components are implemented:

- **With blueprint**: Verify that interaction flows match the Level 3 (Interactions) design. Every designed interaction should be traceable in the code.
- **Zero Implementation Rule**: Check that no new components, interactions, or contracts were introduced beyond what was planned in Step 2. If something was added, flag it -- it may be necessary, but it should be a conscious decision, not scope creep.
- **Final security scan**: Apply `framework:secure-coding` across component boundaries. Check that data flowing between components crosses trust boundaries safely.

<!-- AI reasoning: The Zero Implementation Rule is borrowed from design-first methodology. It catches scope creep during implementation -- the most common source of architectural drift. New components may be legitimate, but they should be discussed and planned, not silently introduced. -->

### Step 5: Enrich Context

Throughout Steps 3 and 4, use `framework:context-anchoring` Enrich behavior to keep the living document current:

- **Add key files** as they are created -- path, purpose, layer assignment.
- **Capture implementation decisions** -- library choices, pattern selections, deviations from blueprint, trade-offs made.
- **Resolve open questions** -- if questions from the design phase are answered during implementation, log the resolution.
- **If no context document exists** and significant implementation decisions were made → suggest creating one. The decisions are worth preserving for future sessions.

<!-- AI reasoning: Enrichment during implementation is where context documents become most valuable. Design decisions are relatively stable, but implementation surfaces dozens of micro-decisions (which library, which pattern, which error strategy) that are easy to forget but painful to re-derive. Capturing them as they happen costs almost nothing; recovering them later costs real time. -->
