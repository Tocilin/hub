import { HeartPulse, House, Shirt, UtensilsCrossed, Wallet } from "lucide-react";

import type { HubApp } from "./types";

/**
 * The single source of truth for the launcher. Array order is display order.
 * Adding an app: docs/adding-an-app.md.
 */
export const apps: readonly HubApp[] = [
  {
    id: "finance",
    name: "Finance",
    description: "Accounts, budgets and spending",
    icon: Wallet,
    color: "green",
    status: "coming-soon",
  },
  {
    id: "wardrobe",
    name: "Wardrobe",
    description: "Clothes, outfits and care",
    icon: Shirt,
    color: "violet",
    status: "coming-soon",
  },
  {
    id: "food",
    name: "Food",
    description: "Recipes, meals and groceries",
    icon: UtensilsCrossed,
    color: "amber",
    status: "coming-soon",
  },
  {
    id: "properties",
    name: "Properties",
    description: "Homes, maintenance and documents",
    icon: House,
    color: "blue",
    status: "coming-soon",
  },
  {
    id: "health",
    name: "Health",
    description: "Habits, records and appointments",
    icon: HeartPulse,
    color: "rose",
    status: "coming-soon",
  },
];
