# Security Specification for Mixture Separation Lab (연금술사의 물질 분리 연구소)

## 1. Data Invariants
1. `students/{studentCode}`: Document ID must match `^[a-zA-Z0-9_-]{2,32}$`. The `studentCode` field inside the document must strictly equal the document ID `{studentCode}`.
2. `studentName` must be a string with length between 1 and 30 characters.
3. `totalScore` and `totalCoins` must be non-negative numbers.
4. `unlockedCostumes` must be a list containing at most 20 costume strings.
5. `completedStages` must be a list containing at most 20 stage strings.
6. `leaderboard/{studentCode}`: Document ID must match `^[a-zA-Z0-9_-]{2,32}$`. The `studentCode` must equal the document ID `{studentCode}`, with scores and stars constrained to non-negative numbers.
7. Unrelated collections are strictly denied by default.

## 2. The "Dirty Dozen" Payloads (Designed to Fail)
1. **ID Poisoning Attack**: studentCode with path traversal `../admin` or symbols `*&^%$#`.
2. **Oversized Name Attack**: studentName with 5,000 characters (buffer/DoS attack).
3. **Negative Score Attack**: totalScore = -99999.
4. **Negative Coins Attack**: totalCoins = -500.
5. **Array Exhaustion Attack**: unlockedCostumes with 1,000 items (Denial of Wallet).
6. **Mismatched Path Attack**: Path `students/studentA` with document body `{"studentCode": "studentB"}`.
7. **Type Poisoning Attack**: totalScore is a boolean `true` instead of a number.
8. **Shadow Field Injection**: Injecting an extra unauthorized administrative field `{"isAdmin": true, "unlimitedCoins": true}`.
9. **Unbounded Leaderboard Stars**: totalStars = -1 or non-numeric.
10. **Null Student Code**: studentCode: null.
11. **Random Collection Write**: Attempting to write to `/system_secrets/config`.
12. **Malicious Object in Arrays**: Injecting nested objects inside string lists.

## 3. Test Runner Design
Any test against these 12 malicious payloads must assert `PERMISSION_DENIED`.
Rules enforce validation helpers `isValidStudentProfile` and `isValidLeaderboardEntry` for both create and update operations.
