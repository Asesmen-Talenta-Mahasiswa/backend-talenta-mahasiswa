import Elysia, { t } from "elysia";
import {
  errorResponseModel,
  failResponseModel,
  successResponseModel,
} from "../../common/model";
import { studentFilterModel } from "./model";
import { FilterService } from "./service";
import { ResponseStatus } from "../../common/constant";

export const filterEndpoint = new Elysia({
  prefix: "/filters",
  tags: ["Filter"],
}).get(
  "/students",
  async ({ status }) => {
    const result = await FilterService.getStudentFilter();

    return status(200, {
      status: "success",
      data: {
        degrees: result.degrees,
        departments: result.departments,
        enrollmentYears: result.enrollmentYears,
        faculties: result.faculties,
        majors: result.majors,
      },
    });
  },
  {
    response: {
      200: t.Object({
        status: successResponseModel,
        data: studentFilterModel,
      }),
      422: failResponseModel,
      500: errorResponseModel,
    },
  },
);
