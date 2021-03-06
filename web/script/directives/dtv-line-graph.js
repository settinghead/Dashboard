'use strict';
/*global nv:false */
/*global d3:false */

angular.module('dashboard')
  .directive('lineGraph', ['gooddataQueryService','commonMetricService','$q',
    function(gooddataQueryService,commonMetricService,$q){
     return {
      restrict: 'E',
      scope: {graph:'=graph'},
      templateUrl: 'view/common-line-chart.html',
      link: function (scope) {
        var query, yAxisLabel;
        switch(scope.graph){
          case 'Touch Index':
            query = gooddataQueryService.getTouchesByDay;
            yAxisLabel = 'Touches';
            scope.id = commonMetricService.generateChartId('dailyTouchesLineGraph');
            break;
          case 'Average Response Time':
            query = gooddataQueryService.getResponseTimeByMonth;
            scope.id = commonMetricService.generateChartId('responseTimeChart');
            yAxisLabel = 'Minutes';
          break;
          case 'Zendesk Resolution Time':
            query = gooddataQueryService.getFullResolutionTimesPerMonth;
            yAxisLabel = 'Hours';
            scope.id = commonMetricService.generateChartId('zendeskResolutionTimeChart');
          break;
          default:
            query = function(){
              return $q.reject('Unknown graph: '+scope.graph);
            };
          break;
        }//switch
      scope.title = scope.graph;
      scope.showSpinner = true;
       query()
        .then(function(result){
          var colours = commonMetricService.getChartColours();
          for(var i = 0; i < result.length; i++) {
            result[i].color = colours[i];
            result[i].data = result[i].values;
          }

          nv.addGraph(function() {
            var chart = nv.models.lineChart()
                          .x(function (d) { return d.x; })
                          .y(function (d) { return d.y; })
                          .useInteractiveGuideline(true)
                          .options(commonMetricService.getCommonChartOptions());


            chart.xAxis
            .tickFormat(commonMetricService.dateD3Format);

            chart.yAxis
              .axisLabel(yAxisLabel)
              .tickFormat(d3.format(',.f.2'));

            d3.select('#'+scope.id)
              .datum(result)
              .call(chart);

            nv.utils.windowResize(chart.update);
            return chart;
          });//addGraph
        })//THEN
        .then(null,function(error){
          console.error(error);
          scope.errorMessage = commonMetricService.generateErrorMessage(error);
        })
        .finally(function(){
          scope.showSpinner = false;
        });//query
      }//LINK
    };//return
  }]);//directive