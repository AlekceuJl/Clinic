import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  surveys: defineTable({
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
  }).index("by_clientId", ["clientId"]),

  responses: defineTable({
    surveyId: v.string(),
    answers: v.array(
      v.object({
        questionId: v.string(),
        value: v.any(),
      })
    ),
    submittedAt: v.number(),
  }).index("by_surveyId", ["surveyId"]),
});
