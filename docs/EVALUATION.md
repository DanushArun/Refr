# Endorsly — Evaluation guide

Start with the smallest path that exercises the project. Distinguish source inspection,
syntax/build checks, functional behavior and domain validation when recording a result.

## Guided reading and demonstration

1. **Choose the evaluation mode.** The checked-in demo configuration is enabled. Inspect which
screens use mock state before treating the interface as a live backend demonstration.

2. **Explore a role.** Review seeker discovery/matches/pipeline or endorser inbox/active/earnings.
Role-specific screens share navigation and common components.

3. **Open a conversation.** Follow a person or endorsement into chat and return. Navigation tests
exist for important transitions and route reset behavior.

4. **Evaluate real services.** Disable configured demos and connect the Django backend. Native
haptic/liquid-glass modules require a development build for meaningful platform evaluation.

## Declared checks

These commands/checks describe the intended verification path. Their presence in this
guide does not claim that they passed. See the dated evidence below and the README for setup.

```text
cd frontend && npm run typecheck
cd frontend && npm test -- --runInBand
```

## Evidence levels

| Level | What it establishes | What it does not establish |
| --- | --- | --- |
| Source review | A path exists in tracked code | Successful runtime behavior |
| Syntax/build | Parser/compiler accepts that path | End-to-end correctness |
| Behavioral check | A specific input/output case passed | Generalization beyond cases |
| Domain evaluation | Performance on a stated target setting | Other users/data/environments |

## What to record

- Commit, environment, dependency versions and date.
- Input provenance and whether data is synthetic, public or privately supplied.
- Absolute pass/fail/skip counts; keep failed cases and their root causes.
- Whether external services, hardware or a production deployment were actually exercised.
- Expected output and an artifact showing the observation.

## Review scenarios

- **Demo mode is visible:** A populated screen can come from fixtures; it is not automatically
live evidence.

- **Terminology is intentional:** Public copy uses Endorsement/Endorser/Seeker despite historical
referral identifiers.

- **Service boundary stays separate:** Backend state and authorization are tested against the
separate Django repository.

## Documentation inspection — 7 October 2026

The documentation was traced to committed source and checked for local links, balanced
code fences and supported implementation claims. Historical notebook outputs remain labeled
as historical. Live provider access, private databases and hardware behavior are not inferred
from configuration or dependency files. Any fresh run is recorded separately in the README.

## Next evidence to collect

- Capture real-device navigation and accessibility results.
- Test cross-role flows with demos off.
- Verify native integrations and backend contract together.
