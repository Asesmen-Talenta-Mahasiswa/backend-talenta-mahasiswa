export const UserRole = {
  Student: "mahasiswa",
  Major: "program_studi",
  Department: "jurusan",
  Faculty: "fakultas",
  University: "universitas",
  Admin: "admin",
} as const;

export const TestQuestionType = {
  MultipleChoice: "multiple_choice",
  SingleChoice: "single_choice",
  Likert: "likert",
} as const;

export const TestSubmissionStatus = {
  InProgress: "in_progress",
  Completed: "completed",
} as const;

export const ResponseStatus = {
  Success: "success",
  Error: "error",
  Fail: "fail",
} as const;

export const ServiceStatus = { Healthy: "healthy", Bad: "bad" } as const;

export const SortDirection = {
  ASC: "asc",
  DESC: "desc",
} as const;

export const Gender = {
  Male: "pria",
  Female: "wanita",
} as const;
