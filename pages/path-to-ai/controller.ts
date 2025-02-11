const courses = [
  { name: "Elements of AI" },
  { name: "Building AI" },
];

const books = [
  { title: "Data Science" },
  { title: "Machine Learning" },
  { title: "Deep Learning" },
];

export const controller = {
  meta: {
    navbar: true,
  },
  data: {
    courses,
    books,
  }
};
