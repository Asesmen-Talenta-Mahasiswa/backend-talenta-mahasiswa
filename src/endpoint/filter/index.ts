import Elysia, { t } from "elysia";
import { ResponseStatus } from "../../common/constant";
import {
  errorResponseModel,
  failResponseModel,
  successResponseModel,
} from "../../common/model";
import { studentFilterModel } from "./model";
import { FilterService } from "./service";

export const filterEndpoint = new Elysia({
  prefix: "/filters",
  tags: ["Filter"],
}).get(
  "/students",
  async ({ status }) => {
    const result = await FilterService.getStudentFilter();

    return status(200, {
      status: ResponseStatus.Success,
      data: {
        departments: result.departments,
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
