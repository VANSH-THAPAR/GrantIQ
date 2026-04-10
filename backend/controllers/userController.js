const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private (Needs Token)
const getUserProfile = async (req, res) => {
  try {
    // req.user is attached by the authMiddleware
    const user = await User.findById(req.user._id).select('-password');
    
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private (Needs Token)
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Update fields if provided, otherwise keep existing values
      user.name = req.body.name || user.name;
      user.industry = req.body.industry || user.industry;
      user.businessType = req.body.businessType || user.businessType;
      user.stage = req.body.stage || user.stage;
      user.revenue = req.body.revenue !== undefined ? req.body.revenue : user.revenue;
      user.employeeCount = req.body.employeeCount !== undefined ? req.body.employeeCount : user.employeeCount;
      user.yearOfEstablishment = req.body.yearOfEstablishment || user.yearOfEstablishment;
      user.state = req.body.state || user.state;
      user.city = req.body.city || user.city;
      user.founderCategory = req.body.founderCategory || user.founderCategory;

      const updatedUser = await user.save();

      // Return the updated user info (without password and auth token since this isn't login)
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        industry: updatedUser.industry,
        businessType: updatedUser.businessType,
        stage: updatedUser.stage,
        revenue: updatedUser.revenue,
        employeeCount: updatedUser.employeeCount,
        yearOfEstablishment: updatedUser.yearOfEstablishment,
        state: updatedUser.state,
        city: updatedUser.city,
        founderCategory: updatedUser.founderCategory
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUserProfile, updateUserProfile };