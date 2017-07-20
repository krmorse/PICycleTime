describe('CycleTimeCalculator', function () {

    var data, store;

    function expectChartDataToBe(chartData, categories, cycleTimeSeriesData) {
        expect(chartData.categories).toEqual(categories); 
        expect(chartData.series.length).toBe(2);
        var cylceTimeSeries = chartData.series[0];
        expect(cylceTimeSeries.name).toBe('Cycle Time');
        expect(cylceTimeSeries.data).toEqual(cycleTimeSeriesData);
    }

    beforeEach(function () {
        var model = Rally.test.Mock.dataFactory.getModel('portfolioitem/feature');
        data = Rally.test.Mock.dataFactory.getRecords('portfolioitem/feature', {
            count: 5,
            values: [
                { ActualStartDate: '2017-03-02T00:00:00.000Z', ActualEndDate: '2017-03-06T00:00:00.000Z', Release: { _refObjectName: 'Release 1' } },
                { ActualStartDate: '2017-03-02T00:00:00.000Z', ActualEndDate: '2017-03-03T00:00:00.000Z', Release: { _refObjectName: 'Release 1' } },
                { ActualStartDate: '2017-06-04T00:00:00.000Z', ActualEndDate: '2017-06-10T00:00:00.000Z', Release: { _refObjectName: 'Release 2' } },
                { ActualStartDate: '2017-06-05T00:00:00.000Z', ActualEndDate: '2017-06-08T00:00:00.000Z', Release: { _refObjectName: 'Release 2' } },
                { ActualStartDate: '2017-06-06T00:00:00.000Z', ActualEndDate: '2017-06-13T00:00:00.000Z', Release: { _refObjectName: 'Release 2' } }
            ]
        });
        store = Ext.create('Rally.data.wsapi.Store', {
            model: model,
            data: data
        });
    });

    it('should bucket by quarter', function () {
        var calculator = Ext.create('CycleTimeCalculator', {
            bucketBy: 'quarter'
        });
        var chartData = calculator.prepareChartData(store);
        expectChartDataToBe(chartData, ['2017 Q1', '2017 Q2'], [['2017 Q1', 2.5], ['2017 Q2', 6]]);
    });

    it('should bucket by month', function () {
        var calculator = Ext.create('CycleTimeCalculator', {
            bucketBy: 'month'
        });
        var chartData = calculator.prepareChartData(store);
        expectChartDataToBe(chartData, ['Mar \'17', 'Jun \'17'], [['Mar \'17', 2.5], ['Jun \'17', 6]]);
    });

    it('should bucket by release', function () {
        var calculator = Ext.create('CycleTimeCalculator', {
            bucketBy: 'release'
        });
        var chartData = calculator.prepareChartData(store);
        expectChartDataToBe(chartData, ['Release 1', 'Release 2'], [['Release 1', 2.5], ['Release 2', 6]]);
    });
});