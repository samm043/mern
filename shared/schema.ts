const { pgTable, text, integer, timestamp, boolean, jsonb, serial } = require("drizzle-orm/pg-core");
const { relations } = require("drizzle-orm");
const { createInsertSchema } = require("drizzle-zod");
const { z } = require("zod");

// Users table with role-based authentication
const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("user"), // 'user' or 'admin'
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Excel files uploaded by users
const excelFiles = pgTable("excel_files", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  sheets: text("sheets").array().notNull(), // Array of sheet names
  columns: jsonb("columns").notNull(), // Sheet name -> column names
  rowCount: integer("row_count").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Charts generated from Excel data
const charts = pgTable("charts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  fileId: integer("file_id").references(() => excelFiles.id).notNull(),
  title: text("title").notNull(),
  chartType: text("chart_type").notNull(), // 'bar', 'line', 'pie', 'scatter', '3d-bar', '3d-scatter', etc.
  xAxis: text("x_axis").notNull(),
  yAxis: text("y_axis").notNull(),
  sheetName: text("sheet_name").notNull(),
  chartData: jsonb("chart_data").notNull(), // Processed chart data
  chartOptions: jsonb("chart_options"), // Chart configuration options
  is3D: boolean("is_3d").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Analysis results (optional feature)
const aiAnalysis = pgTable("ai_analysis", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  fileId: integer("file_id").references(() => excelFiles.id).notNull(),
  analysisType: text("analysis_type").notNull(), // 'summary', 'insights', 'predictions'
  prompt: text("prompt").notNull(),
  result: text("result").notNull(),
  confidence: integer("confidence"), // AI confidence score
  createdAt: timestamp("created_at").defaultNow(),
});

// Password reset tokens
const passwordResets = pgTable("password_resets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
const usersRelations = relations(users, ({ many }) => ({
  excelFiles: many(excelFiles),
  charts: many(charts),
  aiAnalysis: many(aiAnalysis),
  passwordResets: many(passwordResets),
}));

const excelFilesRelations = relations(excelFiles, ({ one, many }) => ({
  user: one(users, { fields: [excelFiles.userId], references: [users.id] }),
  charts: many(charts),
  aiAnalysis: many(aiAnalysis),
}));

const chartsRelations = relations(charts, ({ one }) => ({
  user: one(users, { fields: [charts.userId], references: [users.id] }),
  file: one(excelFiles, { fields: [charts.fileId], references: [excelFiles.id] }),
}));

const aiAnalysisRelations = relations(aiAnalysis, ({ one }) => ({
  user: one(users, { fields: [aiAnalysis.userId], references: [users.id] }),
  file: one(excelFiles, { fields: [aiAnalysis.fileId], references: [excelFiles.id] }),
}));

const passwordResetsRelations = relations(passwordResets, ({ one }) => ({
  user: one(users, { fields: [passwordResets.userId], references: [users.id] }),
}));

// Zod schemas
const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const insertExcelFileSchema = createInsertSchema(excelFiles).omit({
  id: true,
  uploadedAt: true,
});

const insertChartSchema = createInsertSchema(charts).omit({
  id: true,
  createdAt: true,
});

const insertAiAnalysisSchema = createInsertSchema(aiAnalysis).omit({
  id: true,
  createdAt: true,
});

const insertPasswordResetSchema = createInsertSchema(passwordResets).omit({
  id: true,
  createdAt: true,
});

module.exports = {
  users,
  excelFiles,
  charts,
  aiAnalysis,
  passwordResets,
  usersRelations,
  excelFilesRelations,
  chartsRelations,
  aiAnalysisRelations,
  passwordResetsRelations,
  insertUserSchema,
  insertExcelFileSchema,
  insertChartSchema,
  insertAiAnalysisSchema,
  insertPasswordResetSchema,
};