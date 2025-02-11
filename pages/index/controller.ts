import { Controller } from "../../wings/models.ts";

const me = {
  firstName: "Johannes",
  title: "Software Developer",
  employer: "Consid",
};

export const controller: Controller = {
  meta: {
    title: 'Home',
    navbar: true,
  },
  data: { me },
};
