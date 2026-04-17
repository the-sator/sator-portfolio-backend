import { PAGINATION_LIMIT } from "@/constant/app";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getPaginationMeta = (filter: any, count: number) => {
  const page = filter.page ? Number(filter.page) : 1;
  const page_size = filter.page_size
    ? Number(filter.page_size)
    : PAGINATION_LIMIT;
  const page_count = Math.ceil(count / page_size);
  const total_count = count;
  return { page, page_count, page_size, total_count };
};
