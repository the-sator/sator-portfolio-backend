import { LIMIT } from "@/constant/base";

export const getPaginationMetadata = (
  filter: Record<string, any>,
  count: number
) => {
  const current_page = filter.page ? Number(filter.page) : 1;
  const page_size = filter.limit ? Number(filter.limit) : LIMIT;
  const page_count = Math.ceil(count / page_size);
  const page = count > current_page * page_size ? current_page + 1 : null;
  return { current_page, page_size, page_count, page };
};
