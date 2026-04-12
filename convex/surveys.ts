import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("surveys").collect();
    return all.filter(
      (s) => s.userId === args.userId || !s.userId
    );
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
    userId: v.string(),
    companyName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("surveys")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .first();

    if (existing) {
      if (existing.userId && existing.userId !== args.userId) {
        throw new Error("Нет доступа к этому опросу");
      }
      await ctx.db.patch(existing._id, {
        title: args.title,
        description: args.description,
        questions: args.questions,
        brandColor: args.brandColor,
        isActive: args.isActive,
        userId: args.userId,
        companyName: args.companyName,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("surveys", args);
    }
  },
});

export const remove = mutation({
  args: { clientId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("surveys")
      .withIndex("by_clientId", (q) => q.eq("clientId", args.clientId))
      .first();
    if (existing) {
      if (existing.userId && existing.userId !== args.userId) {
        throw new Error("Нет доступа к этому опросу");
      }
      await ctx.db.delete(existing._id);
    }
  },
});
