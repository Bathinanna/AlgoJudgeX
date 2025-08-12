const ThemeSettings = require('../models/themeModel');

const getThemeSettings = async (req, res) => {
  try {
    const settings = await ThemeSettings.getSingleton();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateThemeSettings = async (req, res) => {
  try {
    const { defaultTheme, allowUserOverride } = req.body;
    const settings = await ThemeSettings.getSingleton();
    if (defaultTheme) settings.defaultTheme = defaultTheme;
    if (typeof allowUserOverride === 'boolean') settings.allowUserOverride = allowUserOverride;
    settings.updatedAt = Date.now();
    await settings.save();
    res.json({ message: 'Theme settings updated', settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getThemeSettings, updateThemeSettings };
