/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai_functions_generate_profile from "../ai_functions/generate_profile.js";
import type * as ai_functions_minimax_helpers from "../ai_functions/minimax_helpers.js";
import type * as ai_functions_minimax_helpers_internal from "../ai_functions/minimax_helpers_internal.js";
import type * as ai_functions_rewrite_field from "../ai_functions/rewrite_field.js";
import type * as ai_functions_suggest_layout from "../ai_functions/suggest_layout.js";
import type * as career_data from "../career_data.js";
import type * as cvs from "../cvs.js";
import type * as profiles from "../profiles.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "ai_functions/generate_profile": typeof ai_functions_generate_profile;
  "ai_functions/minimax_helpers": typeof ai_functions_minimax_helpers;
  "ai_functions/minimax_helpers_internal": typeof ai_functions_minimax_helpers_internal;
  "ai_functions/rewrite_field": typeof ai_functions_rewrite_field;
  "ai_functions/suggest_layout": typeof ai_functions_suggest_layout;
  career_data: typeof career_data;
  cvs: typeof cvs;
  profiles: typeof profiles;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
