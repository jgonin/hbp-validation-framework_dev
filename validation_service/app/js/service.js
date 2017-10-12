var ContextServices = angular.module('ContextServices', ['ngResource', 'btorfs.multiselect', 'ApiCommunicationServices', ]);

ContextServices.service('Context', ['$rootScope', '$location', 'AppIDRest', 'CollabIDRest',
    function($rootScope, $location, AppIDRest, CollabIDRest) {
        var ctx;
        var state_type = undefined;
        var state = undefined;
        var external = undefined;
        var collabID = undefined;
        var appID = undefined;


        var modelCatalog_goToHomeView = function() {
            clearState();
            setTimeout(function() {
                $location.path('/model-catalog/');

            }, 300);
        };
        var modelCatalog_goToModelDetailView = function(model_id) {

            sendState("model", model_id);
            setState(model_id);

            $location.path('/model-catalog/detail/' + model_id);
            // $location.replace();


            // $scope.$apply()

            setTimeout(function() {}, 0);
        };
        var validation_goToTestCatalogView = function() {
            sendState("id", '0');
            setState('0');
            $location.path('/home/validation_test');
        };

        var validation_goToHomeView = function() {
            clearState();
            setTimeout(function() {
                $location.path('/home/');
            }, 300);

        };
        var validation_goToModelDetailView = function(model_id) {
            sendState("model", model_id);
            setState(model_id);
            $location.path('/home/validation_model_detail/' + model_id);
        };
        var validation_goToTestDetailView = function(test_id) {
            sendState("test", test_id);
            setState(test_id);
            $location.path('/home/validation_test/' + test_id);
        };
        var validation_goToResultDetailView = function(result_id) {
            sendState("result", result_id);
            setState(result_id);
            $location.path('/home/validation_test_result/' + result_id);
        };

        var validation_goToModelCatalog = function(model) {
            var collab_id = model.app.collab_id;
            var app_id = model.app.id;

            var url = "https://collab.humanbrainproject.eu/#/collab/" + collab_id + "/nav/" + app_id +
                "?state=model." + model.id + ",external"; //to go to collab api
            window.open(url, 'modelCatalog');
        }

        var setService = function() {
            return new Promise(function(resolve, reject) {

                // _getState();
                temp_state = window.location.search.split("&")[1];


                if (temp_state != undefined && temp_state != "ctxstate=") {
                    temp_state2 = temp_state.split("%2C")[0];
                    temp_state2 = temp_state2.substring(9);
                    state_type = temp_state2.split(".")[0]
                    state = temp_state2.split(".")[1]

                    if (temp_state.split("%2C")[1] != undefined) {
                        external = temp_state.split("%2C")[1];
                    }
                }

                // _getCtx();
                if (ctx == undefined) {
                    ctx = window.location.search.split("&")[0].substring(5);
                }

                // getCollabID();
                if (collabID == undefined || collabID == "") {
                    var collab_request = CollabIDRest.get({ ctx: ctx }); //.collab_id;
                    collab_request.$promise.then(function() {
                        collabID = collab_request.collab_id
                    });
                }

                // getAppID();
                if (appID == undefined || appID == "") {
                    var app_request = AppIDRest.get({ ctx: ctx }); //.collab_id;
                    app_request.$promise.then(function() {
                        appID = app_request.app_id
                    });
                }


                if (app_request == undefined) {
                    if (collab_request == undefined) {
                        resolve();
                    } else {
                        collab_request.$promise.then(function() {
                            resolve();
                        });
                    }
                } else {
                    app_request.$promise.then(function() {

                        if (collab_request == undefined) {
                            resolve();

                        } else {
                            collab_request.$promise.then(function() {
                                resolve();
                            });
                        }
                    });
                }
            });
        };

        var setState = function(id) {
            state = id;
        };


        var getExternal = function() {
            return external;
        }

        var getState = function() {
            return state;
        };

        var getCtx = function() {
            return ctx;
        };

        var getCollabID = function() {
            return collabID;
        };

        var getAppID = function() {
            return appID;
        };



        var sendState = function(type, id) {
            state_type = type;
            window.parent.postMessage({
                eventName: 'workspace.context',

                data: {
                    state: type + '.' + id
                }
            }, 'https://collab.humanbrainproject.eu/');
        };


        var clearState = function() {

            window.parent.postMessage({
                eventName: 'workspace.context',

                data: {
                    state: ''
                }
            }, 'https://collab.humanbrainproject.eu/');

            state = "";
            state_type = undefined;


            setTimeout(function() {
                window.location.hash = "ctx=" + getCtx() + "&ctxstate=";
                window.location.search = "ctx=" + getCtx() + "&ctxstate=";


            }, 0);

        };

        var clearExternal = function() {
            sendState(state_type, state);
            // window.location.search = "ctx=" + getCtx() + "&ctxstate="+state_type+"."+state;
            window.location.search = "ctx=" + getCtx() + "&ctxstate=";
        };

        var getStateType = function() {
            return state_type;
        };

        return {
            setService: setService,
            getCtx: getCtx,
            getCollabID: getCollabID,
            getAppID: getAppID,
            getState: getState,
            sendState: sendState,
            clearState: clearState,
            clearExternal: clearExternal,
            setState: setState,
            getExternal: getExternal,
            getStateType: getStateType,
            modelCatalog_goToHomeView: modelCatalog_goToHomeView,
            modelCatalog_goToModelDetailView: modelCatalog_goToModelDetailView,
            validation_goToHomeView: validation_goToHomeView,
            validation_goToModelDetailView: validation_goToModelDetailView,
            validation_goToTestDetailView: validation_goToTestDetailView,
            validation_goToResultDetailView: validation_goToResultDetailView,
            validation_goToModelCatalog: validation_goToModelCatalog,
            validation_goToTestCatalogView: validation_goToTestCatalogView,
        }
    }
]);



var ParametersConfigurationServices = angular.module('ParametersConfigurationServices', ['ngResource', 'btorfs.multiselect', 'ApiCommunicationServices', 'ContextServices']);
ParametersConfigurationServices.service('CollabParameters', ['$rootScope', 'CollabParameterRest', 'Context',
    function($rootScope, CollabParameterRest, Context) {
        var parameters;
        var ctx;

        var setCollabId = function(type, newObj) {
            parameters.param[0][type] = newObj;
        };

        var addParameter = function(type, newObj) {
            parameters.param[0][type].push(newObj);
        };

        var supprParameter = function(type, Obj) {
            index = parameters.param[0][type].indexOf(Obj);
            parameters.param[0][type].splice(index, 1);
        };

        var getParameters = function(type) {
            return parameters.param[0][type];
        };

        var getParameters_authorized_value_formated = function(type) {
            data = getParameters(type);
            formated_data = [];

            size = data.length;
            for (var i = 0; i < size; i++) {
                formated_data.push({ authorized_value: data[i] });
            }
            return formated_data;
        };

        var getRequestParameters = function() {
            // console.log("getRequestParameters");
            // console.log(Context.getCollabID());
            // console.log(Context.getAppID());

            parameters = CollabParameterRest.get({ app_id: Context.getAppID() });
            return parameters
        };

        var getAllParameters = function() {
            return parameters.param[0];
        };

        var _StringTabToArray = function(tab) {
            tab.forEach(function(value, i) {
                if (value == "") {
                    tab[i] = [];

                } else {
                    tab[i] = value.split(",");
                }

            });

            return tab;
        };

        var _getParamTabValues = function() {
            var param_tab = [
                parameters.param[0]['data_modalities'],
                parameters.param[0]['species'],
                parameters.param[0]['brain_region'],
                parameters.param[0]['cell_type'],
                parameters.param[0]['model_type'],
                parameters.param[0]['test_type'],
                parameters.param[0]['organization'],
            ];

            return param_tab;
        };

        var _setParametersNewValues = function(string_tab) {
            parameters.param[0]['data_modalities'] = string_tab[0];
            parameters.param[0]['species'] = string_tab[1];
            parameters.param[0]['brain_region'] = string_tab[2];
            parameters.param[0]['cell_type'] = string_tab[3];
            parameters.param[0]['model_type'] = string_tab[4];
            parameters.param[0]['test_type'] = string_tab[5];
            parameters.param[0]['organization'] = string_tab[6];
        };


        var setService = function(ctx_param) {
            // ctx = ctx_param;

            if (typeof(parameters) == "undefined") {

                // console.log("setService");
                // console.log(Context.getCollabID());
                // console.log(Context.getAppID());

                parameters = CollabParameterRest.get({ app_id: Context.getAppID() }); //need to get collab number
                parameters.$promise.then(function() {

                    if (parameters.param.length == 0) {

                        post = _postInitCollab();
                        post.$promise.then(function() {
                            parameters = CollabParameterRest.get({ app_id: Context.getAppID() });

                        });
                    } else {

                        param_tab = _getParamTabValues();
                        string_tab = _StringTabToArray(param_tab);
                        _setParametersNewValues(string_tab);
                    }
                });
            }
            return parameters;
        };

        var _postInitCollab = function() {
            initConfiguration();

            post = post_parameters();
            return post;

        };

        var post_parameters = function() {

            var data_to_send = JSON.stringify({
                'id': Context.getAppID(),
                'data_modalities': String(parameters.param[0]['data_modalities']),
                'test_type': String(parameters.param[0]['test_type']),
                'species': String(parameters.param[0]['species']),
                'brain_region': String(parameters.param[0]['brain_region']),
                'cell_type': String(parameters.param[0]['cell_type']),
                'model_type': String(parameters.param[0]['model_type']),
                'organization': String(parameters.param[0]['organization']),
                'app_type': String(parameters.param[0]['app_type']),
                'collab_id': Context.getCollabID(),
            });
            post = CollabParameterRest.save({ app_id: Context.getAppID(), collab_id: Context.getCollabID() }, data_to_send, function(value) {});
            return post;
        };

        var put_parameters = function() {

            var data_to_send = JSON.stringify({
                'id': Context.getAppID(),
                'data_modalities': String(parameters.param[0]['data_modalities']),
                'test_type': String(parameters.param[0]['test_type']),
                'species': String(parameters.param[0]['species']),
                'brain_region': String(parameters.param[0]['brain_region']),
                'cell_type': String(parameters.param[0]['cell_type']),
                'model_type': String(parameters.param[0]['model_type']),
                'organization': String(parameters.param[0]['organization']),
                'app_type': String(parameters.param[0]['app_type']),
                'collab_id': Context.getCollabID(),
            });

            put = CollabParameterRest.put({ app_id: Context.getAppID() }, data_to_send, function(value) {});
            return put;
        };

        var initConfiguration = function() {
            parameters = {
                'param': [{
                    'data_modalities': [],
                    'test_type': [],
                    'species': [],
                    'brain_region': [],
                    'cell_type': [],
                    'model_type': [],
                    'organization': [],
                    'app_type': [],
                    'collab_id': 0,
                }, ],
                '$promise': true,
            };

        };

        return {
            addParameter: addParameter,
            getParameters: getParameters,
            getParameters_authorized_value_formated: getParameters_authorized_value_formated,
            getAllParameters: getAllParameters,
            setService: setService,
            supprParameter: supprParameter,
            post_parameters: post_parameters,
            put_parameters: put_parameters,
            initConfiguration: initConfiguration,
            getRequestParameters: getRequestParameters,
            setCollabId: setCollabId,
        };

    }
]);


var GraphicsServices = angular.module('GraphicsServices', ['ngResource', 'btorfs.multiselect', 'ApiCommunicationServices', 'ParametersConfigurationServices', 'ContextServices']);

GraphicsServices.factory('Graphics', ['$rootScope', 'ValidationResultRest', 'CollabParameters', 'ValidationTestResultRest', 'ValidationModelResultRest', 'Context', 'ValidationResultRest2',
    function($rootScope, ValidationResultRest, CollabParameters, ValidationTestResultRest, ValidationModelResultRest, Context, ValidationResultRest2) {
        // var results_data = undefined;

        var focus = function(list_id_couple, results_data, type, graph_key) {
            var list_data = [];
            var i = 0;
            for (i; i < list_id_couple.length; i++) {
                data = find_result_in_data(list_id_couple[i], results_data, type);
                list_data.push(data);
            }
            $rootScope.$broadcast('data_focussed:updated', list_data, graph_key);
        };
        var find_result_in_data = function(id_couple, results_data, type) {
            var result_to_return = undefined;

            var id_line = id_couple.id_line;
            var id_result = id_couple.id_result;
            //find the correct datablock
            if (type == 'old') {
                var datablock = undefined;
                var i = 0;
                for (i; i < results_data.data_block_id.length; i++) {
                    if (results_data.data_block_id[i].id == id_line) {
                        datablock = results_data.data[i];
                        i = results_data.data_block_id.length;
                    }
                }
                //find the correct result in datablock
                var j = 0;
                for (j; j < datablock.length; j++) {
                    if (datablock[j].id == id_result) {
                        result_to_return = datablock[j];
                    }
                }
                return result_to_return;

            }
            if (type == 'model') {
                //find the correct result in datablock
                for (var i in results_data) {
                    if (id_result == results_data[i].id) {
                        result_to_return = results_data[i]
                    }
                }
                return result_to_return;
            }
            if (type == 'test') {
                //find the correct result in datablock
                for (var i in results_data) {
                    if (id_result == results_data[i].result.id) {
                        result_to_return = results_data[i]
                    }
                }
                return result_to_return;
            }
        };

        var getResultsfromTestID = function(test, ids) {
            return new Promise(function(resolve, reject) {
                var values = [];
                var list_ids = [];
                var j = 0;
                var x = 0;

                var results_data = ValidationTestResultRest.get({ app_id: Context.getAppID(), test_id: test.tests[0].id, list_id: ids, });
                results_data.$promise.then(function() {
                    for (j; j < results_data.data.length; j++) {
                        values[j] = _manageDataForGraph(results_data.data[j], results_data.data_block_id[j].id)
                    };
                    for (x; x < results_data.versions_id_all.length; x++) {
                        list_ids[x] = results_data.versions_id_all[x];
                    };
                    var data = { 'values': values, 'ids_all': list_ids, 'results': results_data }
                    resolve(data);
                });
            });
        };
        var getResultsfromTestID2 = function(test) {
            return new Promise(function(resolve, reject) {
                var values = [];
                var list_ids = [];
                var results = [];
                var results_data = ValidationResultRest2.get({ app_id: Context.getAppID(), test_id: test.tests[0].id, order: 'model' });
                results_data.$promise.then(function() {
                    for (var model in results_data.models) {
                        for (var instance in results_data.models[model].model_instances) {
                            //get line id; test_id is replaced by alias if it exists
                            var line_id = model + '( ' + results_data.models[model].model_instances[instance].version + ' )';
                            if (results_data.models[model].alias) {
                                line_id = results_data.models[model].alias + '( ' + results_data.models[model].model_instances[instance].version + ' )';
                            }
                            values.push(_manageDataForTestGraph2(results_data.models[model].model_instances[instance].tests, line_id, model));
                            list_ids.push(line_id)
                        };
                    };
                    //manage data for focus
                    for (var model in results_data.models) {
                        for (var instance in results_data.models[model].model_instances) {
                            if (results_data.models[model].alias) {
                                m = results_data.models[model].alias
                            } else { m = model }
                            for (var t in results_data.models[model].model_instances[instance].tests) {
                                for (var c in results_data.models[model].model_instances[instance].tests[t].test_codes) {
                                    var additional_data = {
                                        "model": m,
                                        "model_instance": results_data.models[model].model_instances[instance].version,
                                        "test_code": results_data.models[model].model_instances[instance].tests[t].test_codes[c].version
                                    }
                                    results.push({ "result": results_data.models[model].model_instances[instance].tests[t].test_codes[c].result, "additional_data": additional_data })
                                }
                            }
                        }
                    }
                });
                resolve({ 'values': values, 'results': results, 'list_ids': list_ids });
            });
        }
        var _manageDataForTestGraph2 = function(data, line_id, model_id) {
            var values_temp = [];
            for (var t in data) {
                for (var c in data[t].test_codes) {
                    var temp = {
                        x: new Date(data[t].test_codes[c].result.timestamp),
                        y: data[t].test_codes[c].result.score,
                        id: line_id,
                        id_test_result: data[t].test_codes[c].result.id,
                    };
                    values_temp.push(temp);
                };
            };
            var data_to_return = {
                values: values_temp, //values - represents the array of {x,y} data points
                key: line_id, //key  - the name of the series.
                color: _pickRandomColor(), //color - optional: choose your own line color.
                test_id: model_id,
            };
            return data_to_return;
        }

        function getResultsfromModelResultID2(model, score_type) {
            return new Promise(function(resolve, reject) {
                var values = [];
                var list_ids = [];
                var results = [];
                var results_data = ValidationResultRest2.get({ app_id: Context.getAppID(), model_id: model.models[0].id, order: 'test', score_type: score_type }); //will need to add score_type
                results_data.$promise.then(function() {
                    // var tests_id = Object.keys(results_data.tests);
                    // var i = 0;
                    // for (i; i < tests_id.length; i++) {
                    //     var codes_id = Object.keys(results_data.tests[tests_id[i]].test_codes);
                    //     console.log(codes_id)
                    //     var j = 0;
                    //     for (j; j < codes_id.length; j++) {
                    //         //get line id; test_id is replaced by alias if it exists
                    //         var line_id = tests_id[i] + '( ' + results_data.tests[tests_id[i]].test_codes[codes_id[j]].version + ' )';
                    //         if (results_data.tests[tests_id[i]].alias) {
                    //             line_id = results_data.tests[tests_id[i]].alias + '( ' + results_data.tests[tests_id[i]].test_codes[codes_id[j]].version + ' )';
                    //         }
                    //         values[i * j] = _manageDataForGraph2(results_data.tests[tests_id[i]].test_codes[codes_id[j]].models, line_id, tests_id[i], results_data.tests[tests_id[i]].score_type);
                    //         console.log("length of values", a)
                    //         list_ids.push(line_id);
                    //     };
                    // };
                    for (var test in results_data.tests) {
                        for (var code in results_data.tests[test].test_codes) {

                            //get line id; test_id is replaced by alias if it exists
                            var line_id = test + '( ' + results_data.tests[test].test_codes[code].version + ' )';
                            if (results_data.tests[test].alias) {
                                line_id = results_data.tests[test].alias + '( ' + results_data.tests[test].test_codes[code].version + ' )';
                            }
                            var a = values.push(_manageDataForGraph2(results_data.tests[test].test_codes[code].models, line_id, test, results_data.tests[test].score_type));
                            list_ids.push(line_id);
                        };
                    };
                    // manage data for focus
                    for (var test in results_data.tests) {
                        for (var code in results_data.tests[test].test_codes) {
                            for (var m in results_data.tests[test].test_codes[code].models) {
                                for (var v in results_data.tests[test].test_codes[code].models[m].model_instances) {
                                    results.push(results_data.tests[test].test_codes[code].models[m].model_instances[v].result);
                                }
                            }
                        }
                    }

                    resolve({ 'values': values, 'results': results, 'list_ids': list_ids });
                });
            });
        };

        var _manageDataForGraph2 = function(data, line_id, test_id, score_type) {
            var values_temp = [];
            for (var m in data) {
                for (var v in data[m].model_instances) {
                    var temp = {
                        x: new Date(data[m].model_instances[v].result.timestamp),
                        y: data[m].model_instances[v].result.score,
                        id: line_id,
                        id_test_result: data[m].model_instances[v].result.id,
                    };
                    values_temp.push(temp);
                };
            };
            var data_to_return = {
                values: values_temp, //values - represents the array of {x,y} data points
                key: line_id, //key  - the name of the series.
                color: _pickRandomColor(), //color - optional: choose your own line color.
                test_id: test_id,
                test_score_type: score_type,
            };
            return data_to_return;
        };
        var getUpdatedGraph = function(data, list_ids) {
            var newdata = [];
            for (var i in data) {
                for (var j in list_ids) {
                    if (data[i].key == list_ids[j]) {
                        newdata.push(data[i]);
                    }
                }
            }
            return newdata;
        }

        // async function getGraphsByScoreType(data) {
        //     var new_data;
        //     var score_types = [];
        //     console.log("fegzethgrtz", data, data.length, data[0])
        //     for (var i in data) {
        //         console.log(i, 'iiiiiiiiiiiiii')
        //         var sc_t = data[i].test_score_type;
        //         if (score_types.includes(sc_t)) {
        //             new_data[sc_t].push(data[i]);
        //         } else {
        //             score_types.push(sc_t);
        //             new_data[sc_t] = [];
        //             new_data[sc_t].push(data[i]);
        //         }
        //     }
        //     return await new_data
        // }

        var getResultsfromModelID = function(model, ids) {
            var values = [];
            var list_ids = [];
            var j = 0;
            var x = 0;

            var results_data = ValidationModelResultRest.get({ app_id: Context.getAppID(), model_id: model.models[0].id, list_id: ids, });
            results_data.$promise.then(function() {
                for (j; j < results_data.data.length; j++) {
                    values[j] = _manageDataForGraph(results_data.data[j], results_data.data_block_id[j].id)
                };
                for (x; x < results_data.versions_id_all.length; x++) {
                    list_ids[x] = results_data.versions_id_all[x];
                };
            });

            return { 'values': values, 'ids_all': list_ids, 'results': results_data };
        };

        var _manageDataForGraph = function(data, line_id) {
            var values_temp = [];
            var ij = 0;

            for (ij; ij < data.length; ij++) {
                var temp = {
                    x: new Date(data[ij].timestamp),
                    y: data[ij].score,
                    id: line_id,
                    id_test_result: data[ij].id,
                };
                values_temp.push(temp);
            };
            var data_to_return = {
                values: values_temp, //values - represents the array of {x,y} data points
                key: line_id, //key  - the name of the series.
                color: _pickRandomColor(), //color - optional: choose your own line color.
                infosup: data,
            };
            return data_to_return;
        };

        var _pickRandomColor = function() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            var i = 0;
            for (i; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        };

        var get_lines_options = function(title, subtitle, Yaxislabel, caption, results_data, type, graph_key) {
            options = {
                chart: {
                    type: 'lineChart',
                    height: 450,
                    margin: {
                        top: 20,
                        right: 20,
                        bottom: 40,
                        left: 55
                    },
                    x: function(d) { return d.x; },
                    y: function(d) { return d.y; },
                    useInteractiveGuideline: true,
                    dispatch: {
                        stateChange: function(e) { console.log("stateChange"); },
                        changeState: function(e) { console.log("changeState"); },
                        tooltipShow: function(e) { console.log("tooltipShow"); },
                        tooltipHide: function(e) { console.log("tooltipHide"); },
                    },
                    xAxis: {
                        axisLabel: 'Date',
                        tickFormat: function(d) {
                            return d3.time.format('%d-%m-%y')(new Date(d))
                        },
                    },

                    yAxis: {
                        axisLabel: Yaxislabel,
                        tickFormat: function(d) {
                            return d3.format('.02f')(d);
                        },
                        axisLabelDistance: -10
                    },
                    callback: function(chart) {
                        chart.lines.dispatch.on('elementClick', function(e) {
                            var list_of_results_id = [];
                            var i = 0;
                            for (i; i < e.length; i++) {
                                list_of_results_id.push({ id_line: e[i].point.id, id_result: e[i].point.id_test_result });
                            }
                            focus(list_of_results_id, results_data, type, graph_key);
                        });
                    }
                },
                title: {
                    enable: true,
                    text: title
                },
                subtitle: {
                    enable: true,
                    text: subtitle,
                    css: {
                        'text-align': 'center',
                        'margin': '10px 13px 0px 7px'
                    }
                },
                caption: {
                    enable: false,
                    html: caption,
                    css: {
                        'text-align': 'justify',
                        'margin': '10px 13px 0px 7px'
                    }
                }
            };

            return options;


        }
        var get_DataMultipleResult = function() {
            return multiple_result_data;
        }


        return {
            get_lines_options: get_lines_options,
            find_result_in_data: find_result_in_data,
            focus: focus,
            getResultsfromModelID: getResultsfromModelID,
            getResultsfromTestID: getResultsfromTestID,
            getResultsfromModelResultID2: getResultsfromModelResultID2,
            getResultsfromTestID2: getResultsfromTestID2,
            getUpdatedGraph: getUpdatedGraph,
            // getGraphsByScoreType: getGraphsByScoreType,
        };

    }
]);


var HelpServices = angular.module('HelpServices', ['ngResource', 'btorfs.multiselect', 'ApiCommunicationServices', 'ParametersConfigurationServices', 'ContextServices']);

HelpServices.factory('Help', ['$rootScope', 'Context', 'AuthorizedCollabParameterRest',

    function($rootScope, Context, AuthorizedCollabParameterRest) {
        // var results_data = undefined;
        var getAuthorizedValues = function(parameter) {
            return new Promise(function(resolve, reject) {
                var authorized_params = AuthorizedCollabParameterRest.get({ app_id: Context.getAppID() });
                authorized_params.$promise.then(function() {
                    console.log(authorized_params)
                    if (parameter == 'species') {
                        res = _get_values_only(authorized_params.species);
                        resolve(res);
                    } else if (parameter == 'brain_region') {
                        res = _get_values_only(authorized_params.brain_region);
                        resolve(res);
                    } else if (parameter == 'cell_type') {
                        res = _get_values_only(authorized_params.cell_type);
                        resolve(res);
                    } else if (parameter == 'test_type') {
                        res = _get_values_only(authorized_params.test_type);
                        resolve(res);
                    } else if (parameter == 'model_type') {
                        res = _get_values_only(authorized_params.model_type);
                        resolve(res);
                    } else if (parameter == 'score_type') {
                        res = _get_values_only(authorized_params.score_type);
                        resolve(res);
                    } else if (parameter == 'data_modalities') {
                        res = _get_values_only(authorized_params.data_modalities);
                        resolve(res);
                    } else if (parameter == 'all') {
                        var j = 0;
                        var res = {
                            'species': _get_values_only(authorized_params.species),
                            'brain_region': _get_values_only(authorized_params.brain_region),
                            'cell_type': _get_values_only(authorized_params.cell_type),
                            'test_type': _get_values_only(authorized_params.test_type),
                            'model_type': _get_values_only(authorized_params.model_type),
                            'score_type': _get_values_only(authorized_params.score_type),
                            'data_modalities': _get_values_only(authorized_params.data_modalities),
                        };
                        resolve(res);
                    } else {
                        resolve(onerror(parameter + ' is not a valid parameter!'));
                    }

                });
            });
        }
        var _get_values_only = function(list_values) {
            values_only = []
            var i = 0;
            for (i; i < list_values.length; i++) {
                values_only.push(list_values[i].authorized_value);
            }

            return values_only;
        }

        return {
            getAuthorizedValues: getAuthorizedValues,
        };

    }
]);