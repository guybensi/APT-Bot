export type FlowState =
  | "choose_city"
  | "choose_neighborhoods"
  | "budget"
  | "rooms"
  | "move_in_date"
  | "no_broker"
  | "living_type"
  | "max_roommates"
  | "confirm";

export type FlowData = {
  city: string | null;
  neighborhoods: string[] | null;
  budget_min: number | null;
  budget_max: number | null;
  rooms_min: number | null;
  rooms_max: number | null;
  move_in_date: Date | null;
  no_broker: boolean | null;
  living_type: string | null;
  max_roommates: number | null;
};

export const initialFlowData = (overrides?: Partial<FlowData>): FlowData => ({
  city: null,
  neighborhoods: null,
  budget_min: null,
  budget_max: null,
  rooms_min: null,
  rooms_max: null,
  move_in_date: null,
  no_broker: null,
  living_type: null,
  max_roommates: null,
  ...overrides
});

export const nextState = (state: FlowState, data: FlowData): FlowState => {
  if (state === "living_type" && data.living_type === "שותפים") {
    return "max_roommates";
  }

  switch (state) {
    case "choose_city":
      return "choose_neighborhoods";
    case "choose_neighborhoods":
      return "budget";
    case "budget":
      return "rooms";
    case "rooms":
      return "move_in_date";
    case "move_in_date":
      return "no_broker";
    case "no_broker":
      return "living_type";
    case "living_type":
      return "confirm";
    case "max_roommates":
      return "confirm";
    default:
      return "confirm";
  }
};
