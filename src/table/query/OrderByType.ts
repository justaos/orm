type OrderByDirectionType = "ASC" | "DESC";

type OrderByType = {
  column: string;
  order: OrderByDirectionType;
};

export type { OrderByType, OrderByDirectionType };
