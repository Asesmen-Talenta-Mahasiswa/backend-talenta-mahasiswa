# Seed Data Structure Documentation

## Overview

The seed data has been updated to reflect the new hierarchical test submission model where:
- Students create **ONE submission** for the main test
- Each submission generates **multiple results** (one per sub-test)
- All answers reference the consolidated submission

---

## Test Hierarchy

### Main Test
```json
{
  "id": 1,
  "name": "Asesmen Talenta Mahasiswa",
  "parentId": null  // Main test
}
```

### Sub-tests (Level 1)
```json
{
  "id": 2,
  "name": "Bidang Karir Ideal",
  "parentId": 1  // Parent is main test
},
{
  "id": 3,
  "name": "Pola Perilaku",
  "parentId": 1  // Parent is main test
}
```

### Sub-tests (Level 2)
```json
{
  "id": 4,
  "name": "Minat Karir",
  "parentId": 2  // Parent is "Bidang Karir Ideal"
},
{
  "id": 5,
  "name": "Karakteristik Diri",
  "parentId": 2  // Parent is "Bidang Karir Ideal"
},
{
  "id": 6,
  "name": "Kesejahteraan Psikologis",
  "parentId": 3  // Parent is "Pola Perilaku"
}
```

**Complete Hierarchy:**
```
Asesmen Talenta Mahasiswa (1)
├── Bidang Karir Ideal (2)
│   ├── Minat Karir (4)
│   └── Karakteristik Diri (5)
└── Pola Perilaku (3)
    └── Kesejahteraan Psikologis (6)
```

---

## Submissions Structure

### Key Changes
- **Before**: Each student had 3 separate submissions (one for each sub-test 4, 5, 6)
- **After**: Each student has ONE submission for the main test (test 1)

### Example: Student 1
```json
{
  "id": "019a4cd5-44ff-7004-bb9e-5c8ca72d1889",
  "studentId": "018f8b20-1000-7a00-8a00-000000000001",
  "testId": 1,  // References main test only
  "status": "completed",
  "createdAt": "2025-10-11T01:11:08.264Z",
  "completedAt": "2025-11-04T02:34:24.816Z"
}
```

### Current Data
- **8 students** = **8 submissions** (one per student)
- All submissions reference `testId: 1` (main test)
- Submission IDs were consolidated from original 24 submissions

---

## Answers Structure

### How It Works
- All answers reference the **consolidated submission**
- Questions belong to specific tests (4, 5, or 6)
- Through questions, we know which sub-test each answer is for

### Example: Student 1's Answers
```json
{
  "testSubmissionId": "019a4cd5-44ff-7004-bb9e-5c8ca72d1889",  // Single submission
  "testQuestionId": "019a4ca6-683a-7000-a723-624cdf348708",    // Question from test 4
  "selectedOptionId": "019a4ca6-683c-704e-a854-18256f63a347"
}
```

### Answer Distribution
- **546 total answers** across all students
- All answers updated to reference consolidated submissions
- Questions remain linked to their original tests (4, 5, or 6)

---

## Results Structure

### Key Design
- **One submission → Multiple results**
- Each result specifies which test it's for via `testId`

### Example: Student 1's Results
```json
[
  {
    "id": "019a4cd5-44fd-700c-a6d5-9b918340212d",
    "testSubmissionId": "019a4cd5-44ff-7004-bb9e-5c8ca72d1889",  // Main submission
    "testId": 4,  // Result for "Minat Karir"
    "result": "praktisi",
    "createdAt": "2025-11-04T02:34:24.816Z"
  },
  {
    "id": "019a4cd5-44ff-7003-a128-fffd2ba76cb2",
    "testSubmissionId": "019a4cd5-44ff-7004-bb9e-5c8ca72d1889",  // Same submission
    "testId": 5,  // Result for "Karakteristik Diri"
    "result": "ESFP",
    "createdAt": "2025-10-20T10:42:06.524Z"
  },
  {
    "id": "019a4cd5-4500-7012-9b71-9eb9a5787df4",
    "testSubmissionId": "019a4cd5-44ff-7004-bb9e-5c8ca72d1889",  // Same submission
    "testId": 6,  // Result for "Kesejahteraan Psikologis"
    "result": "102",
    "createdAt": "2025-10-25T10:45:52.914Z"
  }
]
```

### Result Types by Test

**Test 4 (Minat Karir):**
- Result values: `"praktisi"`, `"teoritis"`, etc.

**Test 5 (Karakteristik Diri - MBTI):**
- Result values: `"ESFP"`, `"ESTJ"`, `"ENTJ"`, `"INFP"`, `"ENFJ"`, `"ISTP"`, etc.

**Test 6 (Kesejahteraan Psikologis):**
- Result values: Numeric scores like `"102"`, `"121"`, `"105"`, `"120"`

---

## Consolidation Process

### What Was Done
1. **Grouped** submissions by student
2. **Kept** the earliest submission per student
3. **Updated** testId from sub-tests (4, 5, 6) to main test (1)
4. **Merged** completion times (used latest completedAt if any submission was completed)
5. **Updated** all answers to reference the kept submission
6. **Updated** all results to reference the kept submission

### Statistics
- Original submissions: **24**
- Consolidated submissions: **8**
- Submissions removed: **16**
- Answers updated: **546**
- Results updated: **35**

---

## Data Integrity

### Constraints Satisfied
✅ All submissions reference main test (testId: 1)
✅ Each student has exactly ONE submission
✅ All answers reference valid submissions
✅ All results reference valid submissions
✅ Results correctly identify which sub-test they're for

### Verification Queries

**Check submissions reference main test:**
```sql
SELECT * FROM test_submission 
WHERE test_id != 1;
-- Should return 0 rows
```

**Check one submission per student:**
```sql
SELECT student_id, COUNT(*) 
FROM test_submission 
GROUP BY student_id 
HAVING COUNT(*) > 1;
-- Should return 0 rows
```

**Check answers reference valid submissions:**
```sql
SELECT tsa.* 
FROM test_submission_answer tsa
LEFT JOIN test_submission ts ON tsa.test_submission_id = ts.id
WHERE ts.id IS NULL;
-- Should return 0 rows
```

**Check results reference valid submissions:**
```sql
SELECT tsr.* 
FROM test_submission_result tsr
LEFT JOIN test_submission ts ON tsr.test_submission_id = ts.id
WHERE ts.id IS NULL;
-- Should return 0 rows
```

---

## Seeding Order

The seed files must be loaded in this order to maintain referential integrity:

1. `users.json`
2. `enrollmentYears.json`
3. `faculties.json`
4. `departments.json`
5. `majors.json`
6. `degrees.json`
7. `students.json`
8. `tests.json` ⭐ (defines test hierarchy)
9. `testInstructions.json`
10. `testNotes.json`
11. `testQuestions.json`
12. `testQuestionOptions.json`
13. `testSubmissions.json` ⭐ (references main test only)
14. `testSubmissionAnswers.json` ⭐ (references consolidated submissions)
15. `testSubmissionResults.json` ⭐ (references consolidated submissions + specific tests)

---

## Example: Complete Student Flow

### Student 1 (018f8b20-1000-7a00-8a00-000000000001)

**1. Takes Main Test:**
```json
{
  "submission_id": "019a4cd5-44ff-7004-bb9e-5c8ca72d1889",
  "test_id": 1,  // "Asesmen Talenta Mahasiswa"
  "status": "completed"
}
```

**2. Answers Questions from All Sub-tests:**
- Answers questions from Test 4 (Minat Karir)
- Answers questions from Test 5 (Karakteristik Diri)
- Answers questions from Test 6 (Kesejahteraan Psikologis)
- All answers reference the same submission ID

**3. Receives Multiple Results:**
```json
[
  {
    "submission_id": "019a4cd5-44ff-7004-bb9e-5c8ca72d1889",
    "test_id": 4,
    "result": "praktisi"
  },
  {
    "submission_id": "019a4cd5-44ff-7004-bb9e-5c8ca72d1889",
    "test_id": 5,
    "result": "ESFP"
  },
  {
    "submission_id": "019a4cd5-44ff-7004-bb9e-5c8ca72d1889",
    "test_id": 6,
    "result": "102"
  }
]
```

**One submission → Three results** ✅

---

## Benefits of This Structure

### ✅ Data Consistency
- One submission per assessment session
- Clear parent-child relationships
- No orphaned answers or results

### ✅ Query Simplicity
- Get all results for a submission: `WHERE submission_id = X`
- Get results by test: `WHERE test_id = Y`
- Get complete assessment: Join submission → answers → results

### ✅ Scalability
- Easy to add more sub-tests
- No schema changes needed
- Results independently queryable

### ✅ Business Logic Alignment
- Matches actual assessment flow
- One test session = one submission
- Multiple dimensions = multiple results

---

## Migration from Old Data

If you have old seed data with multiple submissions per student:

1. Run the consolidation script (already applied to current seed data)
2. Verify all submissions reference main test (test_id: 1)
3. Verify answers and results updated to reference consolidated submissions
4. Check for orphaned records
5. Test seeding with new data

---

## Maintenance Notes

### Adding New Students
- Create ONE submission per student for main test (test_id: 1)
- Add answers referencing the submission
- Add results for each sub-test (test_id: 4, 5, 6)

### Adding New Sub-tests
1. Add new test with appropriate parentId
2. Add questions for the new test
3. Add question options
4. Add results for existing submissions (if applicable)

### Modifying Test Hierarchy
- Ensure main test (id: 1) has parentId: null
- Ensure all submissions reference main test
- Update documentation

---

## File Summary

| File | Records | References |
|------|---------|------------|
| `tests.json` | 6 | Hierarchical structure |
| `testSubmissions.json` | 8 | All reference test_id: 1 |
| `testSubmissionAnswers.json` | 546 | Reference consolidated submissions |
| `testSubmissionResults.json` | 35 | Reference consolidated submissions + specific tests |

---

**Last Updated**: 2025 (Schema Refactoring)
**Status**: ✅ Ready for use
**Constraint**: All submissions must reference main test (enforced by database constraint)