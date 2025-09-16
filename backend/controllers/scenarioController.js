const Scenarios = require('../models/Scenario');

exports.getMe = async (req, res) => {
    const user_id = req.headers.cookie?.split('user_id=')[1];
    const scenarios = await Scenarios.find({ user_id }).sort({ _id: -1 });

    res.json(scenarios);
};

exports.getOther = async (req, res) => {
    const user_id = req.headers.cookie?.split('user_id=')[1];
    const count = await Scenarios.countDocuments({ user_id: { $ne: user_id } });
    const scenarios = await Scenarios.aggregate([
        { $match: { user_id: { $ne: user_id } } },
        { $sample: { size: count } }
    ]);

    res.json(scenarios);
};

exports.getOne = async (req, res) => {
    try {
        const scenario = await Scenarios.findById(req.params.id);
        res.status(200).json(scenario);
    } catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
};

exports.create = async (req, res) => {
    try {
        const user_id = req.headers.cookie?.split('user_id=')[1];

        await Scenarios.create({ ...req.body, user_id });
        res.status(200).json({ massage: "OK" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
};

exports.update = async (req, res) => {
    try {
        await Scenarios.findByIdAndUpdate(req.params.id, req.body);
        res.status(200).json({ massage: "OK" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
};

exports.remove = async (req, res) => {
    try {
        await Scenarios.findByIdAndDelete(req.params.id);
        res.status(200).json({ massage: "OK" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error." });
    }
};
