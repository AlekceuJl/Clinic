import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("surveys").collect();
  },
});

export const get = query({
  args: { clientId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("surveys")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .first();
  },
});

export const save = mutation({
  args: {
    clientId: v.string(),
    title: v.string(),
    description: v.string(),
    questions: v.array(
      v.object({
        id: v.string(),
        type: v.string(),
        title: v.string(),
        description: v.optional(v.string()),
        required: v.boolean(),
        options: v.optional(v.array(v.string())),
        contactFields: v.optional(v.array(v.string())),
      })
    ),
    createdAt: v.number(),
    brandColor: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("surveys")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        description: args.description,
        questions: args.questions,
        brandColor: args.brandColor,
        isActive: args.isActive,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("surveys", args);
    }
  },
});

export const remove = mutation({
  args: { clientId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("surveys")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
