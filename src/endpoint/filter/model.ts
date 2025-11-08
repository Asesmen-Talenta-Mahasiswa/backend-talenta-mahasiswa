import { t } from "elysia";
import { dbModel } from "../../db/model";

const selectDegree = dbModel.select.degree;
const selectDepartment = dbModel.select.department;
const selectEnrollmentYear = dbModel.select.enrollmentYear;
const selectFaculty = dbModel.select.faculty;
const selectMajor = dbModel.select.major;

export const degreeModel = t.Object({
  ...selectDegree,
});

export const departmentModel = t.Object({
  ...selectDepartment,
});

export const enrollmentYearModel = t.Object({
  ...selectEnrollmentYear,
});

export const facultyModel = t.Object({
  ...selectFaculty,
});

export const majorModel = t.Object({
  ...selectMajor,
});
