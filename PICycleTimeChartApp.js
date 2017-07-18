Ext.define('PICycleTimeChartApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    layout: 'fit',
    autoScroll: false,

    requires: [
        'CycleTimeCalculator'
    ],

    config: {
        defaultSettings: {
            bucketBy: 'quarter',
            query: ''
        }
    },

    launch: function() {
        Rally.data.wsapi.ModelFactory.getModel({
            type: 'portfolioitem/feature' //TODO: make configurable/dynamic
        }).then({
            success: function(model) {
                this.model = model;
                this._addChart();
            },
            scope: this
        });
    },

    getSettingsFields: function() {
        return [
            {
                name: 'bucketBy',
                xtype: 'rallycombobox',
                plugins: ['rallyfieldvalidationui'],
                fieldLabel: 'Bucket By',
                displayField: 'name',
                valueField: 'value',
                editable: false,
                allowBlank: false,
                store: {
                    fields: ['name', 'value'],
                    data: [
                        { name: 'Month', value: 'month' },
                        { name: 'Quarter', value: 'quarter' },
                        { name: 'Release', value: 'release' }
                    ]
                },
                lastQuery: ''
            },
            {
                type: 'query'
            }
        ];
    },

    _addChart: function() {
        var context = this.getContext(),
            whiteListFields = ['Milestones', 'Tags'],
            modelNames = [this.model.typePath],
            gridBoardConfig = {
                xtype: 'rallygridboard',
                toggleState: 'chart',
                chartConfig: this._getChartConfig(),
                plugins: [{
                    ptype:'rallygridboardinlinefiltercontrol',
                    showInChartMode: true,
                    inlineFilterButtonConfig: {
                        stateful: true,
                        stateId: context.getScopedStateId('filters'),
                        filterChildren: false,
                        modelNames: modelNames,
                        inlineFilterPanelConfig: {
                            quickFilterPanelConfig: {
                                defaultFields: [],
                                addQuickFilterConfig: {
                                   whiteListFields: whiteListFields
                                }
                            },
                            advancedFilterPanelConfig: {
                               advancedFilterRowsConfig: {
                                   propertyFieldConfig: {
                                       whiteListFields: whiteListFields
                                   }
                               }
                           }
                        }
                    }
                }],
                context: context,
                modelNames: modelNames,
                storeConfig: {
                    filters: this._getFilters()
                }
            };

        this.add(gridBoardConfig);
    },

    _getChartConfig: function() {
        return {
            xtype: 'rallychart',
            chartColors: [
                "#005EB8" // $blue
            ],
            storeType: 'Rally.data.wsapi.Store',
            storeConfig: {
                context: this.getContext().getDataContext(),
                limit: Infinity,
                fetch: this._getChartFetch(),
                sorters: this._getChartSort(),
                pageSize: 2000,
                model: this.model
            },
            calculatorType: 'CycleTimeCalculator',
            calculatorConfig: {
                bucketBy: this.getSetting('bucketBy'),
            },
            chartConfig: {
                chart: { type: 'column' },
                legend: { enabled: false },
                title: {
                    text: ''
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Days'
                    }
                },
                plotOptions: {
                    column: {
                        dataLabels: {
                            enabled: true
                        }
                    }
                }
            }
        };
    },

    onTimeboxScopeChange: function() {
        this.callParent(arguments);

        var gridBoard = this.down('rallygridboard');
        if (gridBoard) {
            gridBoard.destroy();
        }
        this._addChart();
    },

    _getChartFetch: function() {
        return ['ActualStartDate', 'ActualEndDate', 'Release'];
    },

    _getChartSort: function() {
        return [{ property: 'ActualEndDate', direction: 'ASC' }];
    },

    _getFilters: function() {
        var queries = [{
            property: 'ActualEndDate',
            operator: '!=',
            value: null
        }];

        if (this.getSetting('bucketBy') === 'release') {
            queries.push({
                property: 'Release',
                operator: '!=',
                vaue: null
            });
        }

        var timeboxScope = this.getContext().getTimeboxScope();
        if (timeboxScope && timeboxScope.isApplicable(this.model)) {
            queries.push(timeboxScope.getQueryFilter());
        }
        if (this.getSetting('query')) {
            queries.push(Rally.data.QueryFilter.fromQueryString(this.getSetting('query')));
        }
        return queries;
    }
});
