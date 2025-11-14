import { t } from "elysia";
import { dbModel } from "../../db/model";
import { successResponseModel } from "../../common/model";

const selectDepartment = dbModel.select.department;
const selectFaculty = dbModel.select.faculty;
const selectMajor = dbModel.select.major;

const departmentModel = t.Object(selectDepartment);
const facultyModel = t.Object(selectFaculty);
const majorModel = t.Object(selectMajor);

export const filterStudentResponseModel = t.Object({
  status: successResponseModel,
  data: t.Object({
    departments: t.Array(departmentModel),
    faculties: t.Array(facultyModel),
    majors: t.Array(majorModel),
  }),
});
