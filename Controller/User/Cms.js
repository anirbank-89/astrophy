var Achievements = require('../../Models/achievements');

const viewAllAchievements = async (req, res) => {
    var achievements = await Achievements.find().exec();

    if (achievements.length > 0) {
        return res.status(200).json({
            status: true,
            message: "Data get successfully!",
            data: achievements
        });
    }
    else {
        return res.status(200).json({
            status: true,
            message: "No achievement data added.",
            data: null
        });
    }
}

const viewAchievementById = async (req, res) => {
    var id = req.params.id;

    return Achievements.findById(
        { _id: id },
        (err, docs) => {
            if (!err) {
                res.status(200).json({
                    status: true,
                    message: "Data get successfully!",
                    data: docs
                });
            }
            else {
                res.status(500).json({
                    status: false,
                    message: "Invalid. Server error.",
                    error: err.message
                });
            }
        }
    );
}

module.exports = {
    viewAllAchievements,
    viewAchievementById
}