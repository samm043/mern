const { users, excelFiles, charts, aiAnalysis, passwordResets } = require("../shared/schema");
const { db } = require("./db");
const { eq, and, desc } = require("drizzle-orm");
const session = require("express-session");
const connectPg = require("connect-pg-simple");
const { pool } = require("./db");

const PostgresSessionStore = connectPg(session);

class DatabaseStorage {
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username) {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByEmail(email) {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(insertUser) {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id, updates) {
    const result = await db.update(users).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getAllUsers() {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async deactivateUser(id) {
    return await this.updateUser(id, { isActive: false });
  }

  // Excel file operations
  async createExcelFile(insertFile) {
    const result = await db.insert(excelFiles).values(insertFile).returning();
    return result[0];
  }

  async getExcelFile(id) {
    const result = await db.select().from(excelFiles).where(eq(excelFiles.id, id));
    return result[0];
  }

  async getUserExcelFiles(userId) {
    return await db.select().from(excelFiles)
      .where(eq(excelFiles.userId, userId))
      .orderBy(desc(excelFiles.uploadedAt));
  }

  async getAllExcelFiles() {
    return await db.select().from(excelFiles).orderBy(desc(excelFiles.uploadedAt));
  }

  async deleteExcelFile(id) {
    await db.delete(excelFiles).where(eq(excelFiles.id, id));
  }

  // Chart operations
  async createChart(insertChart) {
    const result = await db.insert(charts).values(insertChart).returning();
    return result[0];
  }

  async getChart(id) {
    const result = await db.select().from(charts).where(eq(charts.id, id));
    return result[0];
  }

  async getUserCharts(userId) {
    return await db.select().from(charts)
      .where(eq(charts.userId, userId))
      .orderBy(desc(charts.createdAt));
  }

  async getFileCharts(fileId) {
    return await db.select().from(charts)
      .where(eq(charts.fileId, fileId))
      .orderBy(desc(charts.createdAt));
  }

  async getAllCharts() {
    return await db.select().from(charts).orderBy(desc(charts.createdAt));
  }

  async updateChart(id, updates) {
    const result = await db.update(charts).set(updates).where(eq(charts.id, id)).returning();
    return result[0];
  }

  async deleteChart(id) {
    await db.delete(charts).where(eq(charts.id, id));
  }

  // AI Analysis operations
  async createAiAnalysis(insertAnalysis) {
    const result = await db.insert(aiAnalysis).values(insertAnalysis).returning();
    return result[0];
  }

  async getUserAiAnalysis(userId) {
    return await db.select().from(aiAnalysis)
      .where(eq(aiAnalysis.userId, userId))
      .orderBy(desc(aiAnalysis.createdAt));
  }

  async getFileAiAnalysis(fileId) {
    return await db.select().from(aiAnalysis)
      .where(eq(aiAnalysis.fileId, fileId))
      .orderBy(desc(aiAnalysis.createdAt));
  }

  // Password reset operations
  async createPasswordReset(insertReset) {
    const result = await db.insert(passwordResets).values(insertReset).returning();
    return result[0];
  }

  async getPasswordReset(token) {
    const result = await db.select().from(passwordResets)
      .where(and(
        eq(passwordResets.token, token),
        eq(passwordResets.used, false)
      ));
    return result[0];
  }

  async markPasswordResetUsed(id) {
    await db.update(passwordResets).set({ used: true }).where(eq(passwordResets.id, id));
  }

  async cleanExpiredPasswordResets() {
    await db.delete(passwordResets).where(
      and(
        eq(passwordResets.used, false),
        // Add timestamp comparison for expired tokens
      )
    );
  }
}

const storage = new DatabaseStorage();

module.exports = { storage, DatabaseStorage };