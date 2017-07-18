Ext.define('CycleTimeCalculator', {

    config: {
        bucketBy: ''
    },

    constructor: function (config) {
        this.initConfig(config);
    },

    prepareChartData: function (store) {
        var groupedData = this._groupData(store.getRange(), 'ActualEndDate'),
            categories = _.keys(groupedData),
            data = _.map(groupedData, function (pis, key) {
                var cycleTimes = _.sortBy(_.map(pis, function(pi) {
                    var startDate = pi.get('ActualStartDate'),
                        endDate = pi.get('ActualEndDate');
                        return moment(endDate).diff(moment(startDate), 'days');
                }));

                var middle = Math.floor(cycleTimes.length / 2);
                var median = cycleTimes[middle];
                if (cycleTimes.length % 2 === 0) {
                    median = (cycleTimes[middle - 1] + cycleTimes[middle]) / 2;
                }

                return [key, median];
            });

        return {
            categories: categories,
            series: [
                {
                    name: 'Cycle Time',
                    data: data
                }
            ]
        };
    },

    _groupData: function (records, field) {
        return _.groupBy(records, function (record) {
            if (this.bucketBy === 'month') {
                return moment(record.get(field)).startOf('month').format('MMM \'YY');
            } else if (this.bucketBy === 'quarter') {
                return moment(record.get(field)).startOf('quarter').format('YYYY [Q]Q');
            } else if (this.bucketBy === 'release') {
                return record.get('Release')._refObjectName;
            }
        }, this);
    }
});
