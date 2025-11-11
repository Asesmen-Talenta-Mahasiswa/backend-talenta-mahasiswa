import { t } from "elysia";
import { dbModel } from "../../db/model";

const selectDegree = dbModel.select.degree;
const selectDepartment = dbModel.select.department;
const selectEnrollmentYear = dbModel.select.enrollmentYear;
const selectFaculty = dbModel.select.faculty;
const selectMajor = dbModel.select.major;

const degreeModel = t.Object(selectDegree);
const departmentModel = t.Object(selectDepartment);
const enrollmentYearModel = t.Object(selectEnrollmentYear);
const facultyModel = t.Object(selectFaculty);
const majorModel = t.Object(selectMajor);

export const studentFilterModel = t.Object({
  degrees: t.Array(degreeModel),
  departments: t.Array(departmentModel),
  enrollmentYears: t.Array(enrollmentYearModel),
  faculties: t.Array(facultyModel),
  majors: t.Array(majorModel),
});
