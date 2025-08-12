const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema({
  defaultTheme: { type: String, enum: ['light', 'dark'], default: 'dark' },
  allowUserOverride: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
});

// Singleton helper
themeSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({});
  return doc;
};

module.exports = mongoose.model('ThemeSettings', themeSchema);
