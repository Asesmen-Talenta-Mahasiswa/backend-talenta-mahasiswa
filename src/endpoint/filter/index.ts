import Elysia, { t } from "elysia";
import { ResponseStatus } from "../../common/constant";
import { filterStudentResponseModel } from "./model";
import { FilterService } from "./service";
import { errorResponseModel } from "../../common/model";

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
      200: filterStudentResponseModel,
      500: errorResponseModel,
    },
  },
);
