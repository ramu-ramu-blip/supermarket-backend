const Bill = require('../models/Bill');

const getAnalytics = async (req, res) => {
    try {
        const { startDate, endDate, groupBy = 'Daily' } = req.query;

        // Date filtering
        const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 7));
        const end = endDate ? new Date(endDate) : new Date();
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        const matchStage = {
            $match: {
                createdAt: { $gte: start, $lte: end }
            }
        };

        // 1. Total Stats for the range
        const rangeStats = await Bill.aggregate([
            matchStage,
            {
                $group: {
                    _id: null,
                    total: { $sum: '$netAmount' },
                    count: { $sum: 1 },
                    gst: { $sum: '$gstAmount' }
                }
            }
        ]);

        // 2. Payment Modes for the range
        const paymentModes = await Bill.aggregate([
            matchStage,
            {
                $group: {
                    _id: '$paymentMode',
                    total: { $sum: '$netAmount' }
                }
            }
        ]);

        // 3. Trend Data
        let groupFormat;
        if (groupBy === 'Monthly') groupFormat = "%Y-%m";
        else if (groupBy === 'Weekly') groupFormat = "%Y-%U";
        else groupFormat = "%Y-%m-%d"; // Daily

        const trendData = await Bill.aggregate([
            matchStage,
            {
                $group: {
                    _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
                    val: { $sum: "$netAmount" }
                }
            },
            { $sort: { "_id": 1 } },
            {
                $project: {
                    name: "$_id",
                    val: 1,
                    _id: 0
                }
            }
        ]);

        // 4. Latest Day Stats (for the "Day Sales Report" section)
        // We'll take the stats for the 'end' date specifically
        const dayStart = new Date(end);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(end);
        dayEnd.setHours(23, 59, 59, 999);

        const dayStats = await Bill.aggregate([
            { $match: { createdAt: { $gte: dayStart, $lte: dayEnd } } },
            {
                $group: {
                    _id: '$paymentMode',
                    total: { $sum: '$netAmount' }
                }
            }
        ]);

        const totalDaySales = dayStats.reduce((acc, curr) => acc + curr.total, 0);

        // 5. Monthly Stats (for Dashboard compatibility)
        const monthlySales = await Bill.aggregate([
            { $match: { createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } },
            { $group: { _id: null, total: { $sum: '$netAmount' } } },
        ]);

        // 6. Top Products (for Dashboard compatibility)
        const topProducts = await Bill.aggregate([
            { $unwind: '$items' },
            { $group: { _id: '$items.name', totalQty: { $sum: '$items.quantity' }, totalRev: { $sum: '$items.total' } } },
            { $sort: { totalQty: -1 } },
            { $limit: 20 },
        ]);

        // Construct 'today' stats for compatibility
        const todayStats = {
            total: totalDaySales,
            count: dayStats.length ? await Bill.countDocuments({ createdAt: { $gte: dayStart, $lte: dayEnd } }) : 0,
            gst: dayStats.length ? (await Bill.aggregate([
                { $match: { createdAt: { $gte: dayStart, $lte: dayEnd } } },
                { $group: { _id: null, gst: { $sum: '$gstAmount' } } }
            ]))[0]?.gst || 0 : 0
        };

        res.json({
            range: rangeStats[0] || { total: 0, count: 0, gst: 0 },
            paymentModes,
            trendData,
            dayReport: {
                date: end.toISOString().split('T')[0],
                total: totalDaySales,
                breakdown: dayStats
            },
            // Legacy/Dashboard compatibility
            today: todayStats,
            monthly: monthlySales[0] || { total: 0 },
            topProducts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAnalytics };
