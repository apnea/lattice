# Lattice — How It Works (Diagrams)

Visual reference for Lattice's architecture, workflows, and data flows.
All diagrams use Mermaid syntax. View in any Mermaid-compatible renderer
(GitHub, VS Code Markdown Preview with Mermaid plugin, etc.).

---

## 1. The Three-Tier Architecture

Lattice is built on three tiers that stack on each other. Refiners are
optional — atoms work out of the box with built-in defaults.

```mermaid
graph TB
    subgraph refiners ["REFINERS — Customize"]
        direction LR
        KR["knowledge-priming<br>refiner"]
        AR["architecture<br>refiner"]
        DR["ddd<br>refiner"]
        CR["clean-code<br>refiner"]
        RR["review<br>refiner"]
        LR2["language-idioms<br>refiner"]
        RFR["requirement-forge<br>refiner"]
    end

    subgraph molecules ["MOLECULES — Orchestrate"]
        direction LR
        LI["lattice-init"]
        RF2["requirement-forge"]
        DB["design-blueprint"]
        CF["code-forge"]
        BF["bug-fix"]
        RS["refactor-safely"]
        RV["review"]
        AC["architecture-compass"]
    end

    subgraph atoms ["ATOMS — Guardrails"]
        direction LR
        KP["knowledge-priming"]
        CC["clean-code"]
        AX["architecture"]
        DD["domain-driven-design"]
        SC["secure-coding"]
        TQ["test-quality"]
        DF["design-first"]
        CA["context-anchoring"]
        CJ["collaborative-judgment"]
        RQ["requirement-quality"]
    end

    molecules -->|"compose"| atoms
    refiners -->|"produce standards<br>consumed by"| atoms

    style refiners fill:#f9f,stroke:#333,color:#000
    style molecules fill:#bbf,stroke:#333,color:#000
    style atoms fill:#bfb,stroke:#333,color:#000
```

### What Each Tier Does

| Tier | Count | Role | Invoked By |
|------|-------|------|------------|
| Atoms | 10 | Enforce a single engineering principle via checklists + anti-pattern scans | Molecules auto-activate them; users can invoke standalone |
| Molecules | 8 | Multi-step workflows that compose atoms at the right stages | User types command in AI chat (e.g. `/code-forge`) |
| Refiners | 7 | Guided interviews producing project-specific standards docs | User runs once during setup or when standards evolve |

---

## 2. The Full Pipeline — Feature Lifecycle

The primary delivery path flows left to right. Each stage consumes artifacts
from the previous stage and produces artifacts for the next, all stored in
the `.lattice/` living context layer.

```mermaid
flowchart LR
    INIT["/lattice-init<br>──────────<br>Scan project<br>Suggest refiners<br>Create config.yaml"]

    INIT -->|"setup done"| REQ

    REQ["/requirement-forge<br>──────────<br>Intake &amp; intake<br>Epic definition<br>Feature discovery<br>Feature specs"]

    REQ -->|".lattice/requirements/"| DES

    DES["/design-blueprint<br>──────────<br>L1 Capabilities<br>L2 Components<br>L3 Interactions<br>L4 Contracts"]

    DES -->|".lattice/context/"| CODE

    CODE["/code-forge<br>──────────<br>Load blueprint<br>Inside-out impl<br>Post-gen verification<br>Cross-component check"]

    CODE -->|"code + tests"| REV

    REV["/review<br>──────────<br>Identify delta<br>Classify &amp; load atoms<br>Targeted validation<br>Severity-ordered report"]

    REV -->|"insights to<br>.lattice/learnings/"| CODE2["next cycle<br>smarter"]

    style INIT fill:#ffd700,stroke:#333,color:#000
    style REQ fill:#87ceeb,stroke:#333,color:#000
    style DES fill:#98fb98,stroke:#333,color:#000
    style CODE fill:#ffa07a,stroke:#333,color:#000
    style REV fill:#dda0dd,stroke:#333,color:#000
    style CODE2 fill:#ffa07a,stroke:#333,color:#000,stroke-dasharray: 5 5
```

### Alternative Entry Paths

```mermaid
flowchart TD
    START{What kind of work?} -->|"New feature"| REQ["/requirement-forge"]
    START -->|"Feature, design clear"| DES["/design-blueprint"]
    START -->|"Existing codebase,<br>no direction"| AC["/architecture-compass"]
    START -->|"Structural pain"| RS["/refactor-safely"]
    START -->|"Bug"| BF["/bug-fix"]

    REQ --> DES2["/design-blueprint"]
    DES --> CODE["/code-forge"]
    DES2 --> CODE
    RS --> REV["/review"]
    BF --> REV
    CODE --> REV

    AC -->|"first move"| FM{Which molecule<br>for first move?}
    FM -->|"/refactor-safely"| RS
    FM -->|"/design-blueprint"| DES2
    FM -->|"/code-forge"| CODE

    style START fill:#ffd700,stroke:#333,color:#000
    style REV fill:#dda0dd,stroke:#333,color:#000
```

---

## 3. Molecule Composition Map

Every molecule composes specific atoms. Some atoms are "always on" for that
molecule; others are conditional (loaded only when the code touches that
concern).

```mermaid
flowchart TB
    subgraph mol ["MOLECULES"]
        LI["lattice-init"]
        RF2["requirement-forge"]
        DB["design-blueprint"]
        CF["code-forge"]
        BF["bug-fix"]
        RS["refactor-safely"]
        RV["review"]
        AC["architecture-compass"]
    end

    subgraph at ["ATOMS"]
        KP["knowledge-priming"]
        CC["clean-code"]
        AX["architecture"]
        DD["domain-driven-design"]
        SC["secure-coding"]
        TQ["test-quality"]
        DF["design-first"]
        CA["context-anchoring"]
        CJ["collaborative-judgment"]
        RQ["requirement-quality"]
    end

    %% lattice-init
    LI --> KP

    %% requirement-forge
    RF2 --> RQ
    RF2 -.->|"conditional"| KP
    RF2 --> CJ

    %% design-blueprint
    DB --> KP
    DB --> CA
    DB --> CJ
    DB --> DF
    DB --> AX
    DB --> DD

    %% code-forge
    CF --> KP
    CF --> CA
    CF --> CJ
    CF --> AX
    CF --> CC
    CF -.->|"domain layer only"| DD
    CF -.->|"trust boundaries only"| SC
    CF -.->|"when writing tests"| TQ

    %% bug-fix
    BF --> KP
    BF --> CA
    BF --> CJ
    BF --> CC
    BF --> TQ
    BF -.->|"conditional"| AX
    BF -.->|"conditional"| DD
    BF -.->|"conditional"| SC

    %% refactor-safely
    RS --> KP
    RS --> CA
    RS --> CJ
    RS --> CC
    RS --> TQ
    RS -.->|"conditional"| DF
    RS -.->|"conditional"| AX
    RS -.->|"conditional"| DD
    RS -.->|"conditional"| SC

    %% review
    RV --> KP
    RV --> CJ
    RV --> CC
    RV -.->|"conditional"| AX
    RV -.->|"conditional"| DD
    RV -.->|"conditional"| SC
    RV -.->|"conditional"| TQ

    %% architecture-compass
    AC --> KP
    AC --> AX
    AC -.->|"strategic only"| DD
    AC --> CJ

    linkStyle 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35 stroke:#666,stroke-width:2px
    linkStyle 1,3,7,8,9,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35 stroke:#999,stroke-width:1px,stroke-dasharray: 4 4
```

**Solid arrows** = always composed. **Dashed arrows** = conditional (loaded only when the work touches that concern).

---

## 4. Atom Config Resolution

When an atom activates, it resolves its rules through a layered lookup.
The resolution order is: defaults -> language idioms -> custom overlay.

```mermaid
flowchart TD
    START["Atom activates"] --> A{"Check<br>.lattice/config.yaml"}
    A -->|"no config"| DEFAULTS["Use embedded<br>./references/defaults.md"]
    A -->|"config found"| B{"Config has<br>atom path key?<br>(e.g. paths.clean_code)"}
    B -->|"no"| DEFAULTS
    B -->|"yes"| C{"Custom doc<br>exists at path?"}
    C -->|"no"| DEFAULTS
    C -->|"yes"| D{"Frontmatter<br>mode?"}
    D -->|"overlay<br>(default)"| OVERLAY["Read defaults first<br>then apply custom<br>sections on top"]
    D -->|"override"| OVERRIDE["Use custom doc<br>as sole reference"]

    DEFAULTS --> E{"Language idioms<br>path configured?"}
    OVERLAY --> E
    OVERRIDE --> E

    E -->|"yes"| IDIOMS["Adapt sections using<br>language-specific patterns<br>(idioms take precedence)"]
    E -->|"no"| DONE["Atom rules ready"]

    IDIOMS --> DONE

    style START fill:#ffd700,stroke:#333,color:#000
    style DEFAULTS fill:#98fb98,stroke:#333,color:#000
    style OVERLAY fill:#87ceeb,stroke:#333,color:#000
    style OVERRIDE fill:#ffa07a,stroke:#333,color:#000
    style IDIOMS fill:#dda0dd,stroke:#333,color:#000
    style DONE fill:#bfb,stroke:#333,color:#000
```

### Resolution Order Visualized

```
+---------------------------------------------------+
|  Layer 3: Custom overlay   (highest precedence)   |  <- .lattice/standards/clean-code.md (changed sections only)
+---------------------------------------------------+
|  Layer 2: Language idioms  (adapt per language)    |  <- .lattice/standards/language-idioms.md (if present)
+---------------------------------------------------+
|  Layer 1: Embedded defaults (base rules)           |  <- ./references/defaults.md (ships with Lattice)
+---------------------------------------------------+
```

---

## 5. The `.lattice/` Living Context Layer

The `.lattice/` folder is the project's AI memory. It grows with every
feature cycle — each pipeline stage reads from and writes to it.

```mermaid
flowchart TB
    subgraph lattice [".lattice/ folder"]
        direction TB
        CONFIG["config.yaml<br>(central config)"]

        subgraph standards ["standards/"]
            KB["knowledge-base.md"]
            CC["clean-code.md"]
            AX["architecture.md"]
            DD["ddd-principles.md"]
            RS2["review-standards.md"]
            RQS["requirement-standards.md"]
            LI2["language-idioms.md"]
        end

        subgraph requirements ["requirements/"]
            IDX["index.md<br>(apex index)"]
            FEAT["features/<br>(per-feature specs)"]
        end

        subgraph context ["context/"]
            CTX["<feature>.md<br>(living documents)"]
        end

        subgraph learnings ["learnings/"]
            RI["review-insights.md<br>(~50 entries cap)"]
        end

        subgraph reviews ["reviews/"]
            RL["review-log.md<br>(~20 entries rolling)"]
        end

        subgraph insights ["insights/"]
            AI["architecture.md"]
        end
    end

    subgraph pipeline ["Pipeline Stages"]
        REFINER["Refiners"]
        REQFORGE["requirement-forge"]
        DESBLUE["design-blueprint"]
        CODEFORGE["code-forge"]
        REVIEW["review"]
        ARCCOMPASS["architecture-compass"]
    end

    %% Writes
    REFINER -->|"writes"| standards
    REQFORGE -->|"writes"| requirements
    DESBLUE -->|"writes"| context
    CODEFORGE -->|"enriches"| context
    CODEFORGE -->|"enriches"| learnings
    REVIEW -->|"writes"| reviews
    REVIEW -->|"appends"| learnings
    ARCCOMPASS -->|"writes"| insights

    %% Reads
    CODEFORGE -.->|"reads"| learnings
    CODEFORGE -.->|"reads"| context
    DESBLUE -.->|"reads"| requirements
    ATOMS2["All atoms"] -.->|"reads"| standards
    ATOMS2 -.->|"reads"| CONFIG

    style lattice fill:#f5f5f5,stroke:#333,color:#000
    style pipeline fill:#e8e8ff,stroke:#333,color:#000
```

### Subfolder Lifecycles

| Folder | Written By | Read By | Lifecycle |
|--------|-----------|---------|-----------|
| `standards/` | Refiners | All atoms via config resolution | Stable — set once, rarely changes |
| `requirements/` | requirement-forge | design-blueprint | Per cycle — created with features, updated as specs evolve |
| `context/` | design-blueprint, code-forge, refactor-safely, bug-fix | code-forge, refactor-safely, bug-fix, review | Per feature — created on start, enriched during work |
| `learnings/` | review | code-forge, refactor-safely, bug-fix (at session start) | Append-only, pruned at ~50 entries |
| `reviews/` | review | Project health visibility | Rolling window, ~20 entries |
| `insights/` | architecture-compass | architecture-compass (resume) | One per project, updated as direction evolves |

---

## 6. Two-Pass Generation Model

Lattice uses a generate-then-verify approach rather than trying to generate
and validate simultaneously. This is more reliable — the AI reviews its own
output against atom checklists before presenting it.

```mermaid
flowchart LR
    GEN["PASS 1<br>Generate<br>code + tests"] --> VERIFY["PASS 2<br>Verify against<br>atom checklists"]
    VERIFY -->|"violations found"| FIX["Fix violations"]
    FIX --> VERIFY
    VERIFY -->|"all checks pass"| JUDGMENT{"Judgment calls<br>flagged?"}
    JUDGMENT -->|"yes"| SURFACE["Surface options<br>via collaborative-<br>judgment protocol"]
    JUDGMENT -->|"no"| PRESENT["Present code<br>to user"]
    SURFACE --> PRESENT

    style GEN fill:#ffa07a,stroke:#333,color:#000
    style VERIFY fill:#98fb98,stroke:#333,color:#000
    style FIX fill:#ffa07a,stroke:#333,color:#000
    style PRESENT fill:#87ceeb,stroke:#333,color:#000
    style SURFACE fill:#dda0dd,stroke:#333,color:#000
```

### Verification Tools Per Atom

Each atom provides two verification instruments used during Pass 2:

```
+-----------------------------------+  +-----------------------------------+
| Self-Validation Checklist         |  | Active Anti-Pattern Scan          |
| (numbered, imperative STOP lang)  |  | (checkbox format, scan for smells)|
|                                   |  |                                   |
| 1. SINGLE RESPONSIBILITY: ...     |  | [ ] God Function: ...             |
| 2. SIZE: ...                      |  | [ ] Deep Nesting: ...             |
| 3. COMPLEXITY: ...                |  | [ ] Cryptic Naming: ...           |
| 4. ABSTRACTION LEVEL: ...        |  | [ ] Long Parameter Lists: ...     |
| 5. NAMING: ...                    |  | [ ] Premature Abstraction: ...    |
| ...                               |  | ...                               |
+-----------------------------------+  +-----------------------------------+
         Hard rules                        Smell-level issues
```

---

## 7. Code-Forge — Inside-Out Build Order

code-forge builds from the inside out so that each layer's dependencies
already exist when it is built. Atoms are applied conditionally based on
which layer and which concerns are active.

```mermaid
flowchart TD
    subgraph layer1 ["LAYER 1: Domain"]
        direction LR
        D1["Entities"]
        D2["Value Objects"]
        D3["Aggregates"]
        D4["Domain Services"]
    end

    subgraph layer2 ["LAYER 2: Infrastructure"]
        direction LR
        I1["Repositories"]
        I2["External Adapters"]
        I3["Data Access"]
    end

    subgraph layer3 ["LAYER 3: Application"]
        direction LR
        A1["Use Cases"]
        A2["Command Handlers"]
        A3["Query Handlers"]
    end

    subgraph layer4 ["LAYER 4: Interface"]
        direction LR
        F1["Controllers"]
        F2["Presenters"]
        F3["DTOs"]
    end

    layer1 --> layer2 --> layer3 --> layer4

    subgraph atoms_applied ["Atoms Applied Per Layer"]
        ALL["clean-code + architecture<br>(always, all layers)"]
        DOM["domain-driven-design<br>(domain layer only)"]
        SEC["secure-coding<br>(trust boundaries only)"]
        TEST["test-quality<br>(when writing tests)"]
    end

    layer1 -.- DOM
    layer2 -.- SEC
    layer4 -.- SEC

    style layer1 fill:#98fb98,stroke:#333,color:#000
    style layer2 fill:#87ceeb,stroke:#333,color:#000
    style layer3 fill:#dda0dd,stroke:#333,color:#000
    style layer4 fill:#ffd700,stroke:#333,color:#000
```

### Per-Component Workflow

```mermaid
sequenceDiagram
    participant User
    participant CodeForge as code-forge
    participant Atoms as Atom Checklists

    CodeForge->>CodeForge: Load learnings + blueprint
    CodeForge->>User: Present implementation plan
    User->>CodeForge: Approve plan + choose review mode

    loop For each component (inside-out)
        CodeForge->>CodeForge: Generate code + tests
        CodeForge->>Atoms: Run self-validation checklist
        CodeForge->>Atoms: Run anti-pattern scan
        Atoms-->>CodeForge: Pass / violations
        alt Violations found
            CodeForge->>CodeForge: Fix violations
            CodeForge->>Atoms: Re-verify
        end
        CodeForge->>User: Present component (per review mode)
        User->>CodeForge: Approve / request changes
    end

    CodeForge->>CodeForge: Cross-component verification
    CodeForge->>CodeForge: Enrich context document
    CodeForge->>User: Implementation complete — run /review
```

---

## 8. Review — Delta-Scoped Flow

The review molecule scopes its work to only what changed, loads only the
relevant atoms, and captures insights for future cycles.

```mermaid
flowchart TD
    START["/review invoked"] --> DELTA["Identify the delta<br>(changed files)"]
    DELTA --> CLASSIFY["Classify changes<br>by layer, domain,<br>trust boundaries"]
    CLASSIFY --> LOAD["Load only<br>relevant atoms"]

    LOAD --> VALIDATE["Run validation<br>checklists<br>(hard rules)"]
    VALIDATE --> SCAN["Run anti-pattern<br>scans<br>(smell-level)"]

    SCAN --> REPORT["Produce severity-ordered report<br>critical > warning > suggestion"]
    REPORT --> CAPTURE["Capture recurring patterns<br>to .lattice/learnings/review-insights.md"]
    CAPTURE --> LOG["Log structured summary<br>to .lattice/reviews/review-log.md"]

    LOG --> DONE["Review complete"]

    subgraph atoms_loaded ["Atoms Loaded (conditional)"]
        CC2["clean-code<br>(always)"]
        CJ2["collaborative-judgment<br>(always)"]
        AX2["architecture<br>(if structural change)"]
        DD2["domain-driven-design<br>(if domain change)"]
        SC2["secure-coding<br>(if boundary change)"]
        TQ2["test-quality<br>(if test change)"]
    end

    CLASSIFY -.-> atoms_loaded

    style START fill:#ffd700,stroke:#333,color:#000
    style DONE fill:#98fb98,stroke:#333,color:#000
    style atoms_loaded fill:#f0f0f0,stroke:#999,color:#000
```

---

## 9. The Feedback Loop — How Lattice Gets Smarter Over Time

The key insight: the base framework (atoms, molecules, refiners) never
changes, but the living context layer makes it increasingly effective.

```mermaid
flowchart LR
    subgraph cycle1 ["Cycle 1"]
        C1_CODE["code-forge<br>generates code"]
        C1_REV["review<br>catches issues"]
        C1_INSIGHT["insights written<br>to .lattice/learnings/"]
        C1_CODE --> C1_REV --> C1_INSIGHT
    end

    subgraph cycle2 ["Cycle 2"]
        C2_LOAD["code-forge<br>loads past insights"]
        C2_CODE["generates code<br>(avoids past mistakes)"]
        C2_REV["review<br>catches NEW issues"]
        C2_INSIGHT["insights appended<br>(accumulating)"]
        C2_LOAD --> C2_CODE --> C2_REV --> C2_INSIGHT
    end

    subgraph cycle3 ["Cycle 3"]
        C3_LOAD["code-forge<br>loads richer insights"]
        C3_CODE["generates code<br>(avoids ALL past mistakes)"]
        C3_REV["review scope narrows<br>(fewer recurring issues)"]
        C3_LOAD --> C3_CODE --> C3_REV
    end

    C1_INSIGHT -->|"feeds"| C2_LOAD
    C2_INSIGHT -->|"feeds"| C3_LOAD

    style cycle1 fill:#fff3e0,stroke:#333,color:#000
    style cycle2 fill:#e8f5e9,stroke:#333,color:#000
    style cycle3 fill:#e3f2fd,stroke:#333,color:#000
```

### Context Document Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Create: User starts feature
    Create --> Load: Feature doc created<br>(by design-blueprint)
    Load --> Enrich: User resumes work<br>(by code-forge, refactor, bug-fix)
    Enrich --> Enrich: Decisions captured<br>implementation notes added
    Enrich --> Load: Next session resumes<br>full context restored
    Load --> [*]: Feature complete
```

---

## 10. End-to-End Data Flow Summary

A single view showing all artifacts flowing through the pipeline:

```mermaid
flowchart LR
    subgraph setup ["Setup"]
        INIT2["/lattice-init"]
        REFS["Refiners"]
    end

    subgraph pipeline2 ["Pipeline"]
        REQ2["requirement-forge"]
        DES2["design-blueprint"]
        CODE2["code-forge"]
        REV2["review"]
    end

    subgraph other ["Other Work"]
        BF2["bug-fix"]
        RS3["refactor-safely"]
        AC2["architecture-compass"]
    end

    subgraph store [".lattice/ storage"]
        STD[".lattice/standards/"]
        REQSTORE[".lattice/requirements/"]
        CTXSTORE[".lattice/context/"]
        LRN[".lattice/learnings/"]
        REVSTORE[".lattice/reviews/"]
        INS[".lattice/insights/"]
    end

    INIT2 -->|"config.yaml"| STD
    REFS -->|"*.md"| STD

    REQ2 -->|"feature specs"| REQSTORE
    DES2 -->|"blueprint"| CTXSTORE
    CODE2 -->|"impl decisions"| CTXSTORE
    REV2 -->|"review log"| REVSTORE
    REV2 -->|"insights"| LRN

    CODE2 -.->|"reads"| LRN
    CODE2 -.->|"reads"| CTXSTORE
    DES2 -.->|"reads"| REQSTORE
    REQ2 -.->|"reads"| STD

    BF2 -->|"root cause + fix"| CTXSTORE
    RS3 -->|"structural decisions"| CTXSTORE
    AC2 -->|"arch direction"| INS

    BF2 -.->|"reads"| LRN
    RS3 -.->|"reads"| LRN

    style store fill:#f5f5f5,stroke:#333,color:#000
    style setup fill:#ffd700,stroke:#333,color:#000
    style pipeline2 fill:#e8e8ff,stroke:#333,color:#000
    style other fill:#f0f0f0,stroke:#999,color:#000
```
