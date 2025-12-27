const Bill = require('../models/Bill');
const Expense = require('../models/Expense');

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

        // 3. Trend Data (Revenue)
        let groupFormat;
        if (groupBy === 'Monthly') groupFormat = "%Y-%m";
        else if (groupBy === 'Weekly') groupFormat = "%Y-%U";
        else groupFormat = "%Y-%m-%d"; // Daily

        const revenueTrend = await Bill.aggregate([
            matchStage,
            {
                $group: {
                    _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
                    val: { $sum: "$netAmount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 3b. Trend Data (Expenses)
        const expenseTrend = await Expense.aggregate([
            {
                $match: {
                    date: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: groupFormat, date: "$date" } },
                    val: { $sum: "$amount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Merge Revenue and Expense Trends
        const allDates = Array.from(new Set([
            ...revenueTrend.map(r => r._id),
            ...expenseTrend.map(e => e._id)
        ])).sort();

        const trendData = allDates.map(date => {
            const rev = revenueTrend.find(r => r._id === date);
            const exp = expenseTrend.find(e => e._id === date);
            return {
                name: date,
                revenue: rev ? rev.val : 0,
                expense: exp ? exp.val : 0
            };
        });

        // 3c. Total Expenses for the range
        const rangeExpenses = await Expense.aggregate([
            {
                $match: {
                    date: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
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

        const dayExpenses = await Expense.aggregate([
            { $match: { date: { $gte: dayStart, $lte: dayEnd } } },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
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

        const totalExpenses = rangeExpenses[0]?.total || 0;
        const totalRevenue = rangeStats[0]?.total || 0;

        // 7. Raw Expenses List
        const rawExpenses = await Expense.find({
            date: { $gte: start, $lte: end }
        }).sort({ date: -1 });

        res.json({
            range: {
                total: totalRevenue,
                count: rangeStats[0]?.count || 0,
                gst: rangeStats[0]?.gst || 0,
                expenses: totalExpenses,
                netProfit: totalRevenue - totalExpenses
            },
            paymentModes,
            trendData,
            dayReport: {
                date: end.toISOString().split('T')[0],
                total: totalDaySales,
                expenses: dayExpenses[0]?.total || 0,
                breakdown: dayStats
            },
            expenses: rawExpenses,
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
