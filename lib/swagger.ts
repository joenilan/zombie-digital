import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Social Links API",
        version: "1.0.0",
        description: "API documentation for Social Links management",
      },
      servers: [
        {
          url: process.env.NEXT_PUBLIC_APP_URL,
          description: "Server URL",
        },
      ],
    },
    apiFolder: "app/api",
  });
  return spec;
};
