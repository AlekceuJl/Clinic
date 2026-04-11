import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "citymed_salt_2024");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const register = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existing) {
      return { success: false, error: "Пользователь с таким email уже существует" };
    }

    if (args.password.length < 6) {
      return { success: false, error: "Пароль должен быть не менее 6 символов" };
    }

    const passwordHash = await hashPassword(args.password);

    const userId = await ctx.db.insert("users", {
      email: args.email.toLowerCase(),
      passwordHash,
      name: args.name,
      createdAt: Date.now(),
    });

    return { success: true, userId, name: args.name, email: args.email.toLowerCase() };
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user) {
      return { success: false, error: "Неверный email или пароль" };
    }

    const passwordHash = await hashPassword(args.password);

    if (user.passwordHash !== passwordHash) {
      return { success: false, error: "Неверный email или пароль" };
    }

    return { success: true, userId: user._id, name: user.name, email: user.email };
  },
});

export const me = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    if (!args.email) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (!user) return null;
    return { name: user.name, email: user.email };
  },
});
