import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listBySurvey = query({
  args: { surveyId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("responses")
      .withIndex("by_surveyId", (q) => q.eq("surveyId", args.surveyId))
      .collect();
  },
});

export const submit = mutation({
  args: {
    surveyId: v.string(),
    answers: v.array(
      v.object({
        questionId: v.string(),
        value: v.any(),
      })
    ),
    submittedAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("responses", args);
  },
});
