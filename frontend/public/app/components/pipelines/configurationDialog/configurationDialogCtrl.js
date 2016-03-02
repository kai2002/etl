define(['app/components/configuration/configurationHolderDirective'], function (configurationHolderDirective) {
    function controler($scope, $timeout, $mdDialog, component, template, data) {

        /**
         * Load $scope.general object.
         */
        var loadGeneral = function () {
            $scope.general = {
                'label': component['http://www.w3.org/2004/02/skos/core#prefLabel'],
                'description': component['http://purl.org/dc/terms/description'],
                'color': component['http://linkedpipes.com/ontology/color']
            };
            if ($scope.general.color) {
                $scope.general.templateColor = false;
                $scope.general.color = template['color'];
            } else {
                $scope.general.templateColor = true;
            }
        };

        /**
         * Save options from $scope.general into component.
         */
        var saveGeneral = function () {
            component['http://www.w3.org/2004/02/skos/core#prefLabel'] = $scope.general.label;
            component['http://purl.org/dc/terms/description'] = $scope.general.description;
            if ($scope.general.templateColor) {
                delete component['http://linkedpipes.com/ontology/color'];
            } else {
                component['http://linkedpipes.com/ontology/color'] = $scope.general.color;
            }
        };

        /**
         * Load and prepare $scope.configuration object.
         */
        var loadConfiguration = function () {
            if (component['http://linkedpipes.com/ontology/configurationGraph']) {
                var uri = component['http://linkedpipes.com/ontology/configurationGraph']['@id'];
                $scope.configuration = {
                    'uri': uri,
                    'value': data.model['graphs'][uri]
                };
            } else {
                $scope.configuration = {
                    'uri': component['@id'] + '/configuration',
                    'value': template['configuration']
                };
            }
        };

        var loadDialogs = function () {
            $scope.dialogs = {
                'api': {},
                'loaded': false
            };
            $scope.dialogs.reference = {
                'js': template['dialog']['js'],
                'html': template['dialog']['html']
            };
            //
            var loadIntoDialogs = function () {
                $scope.dialogs.api.setConfiguration($scope.configuration.value);
                $scope.dialogs.loaded = true;
            };
            // The content of the configuration tab is initialized when displayed, so we need to set
            // cofiguration on that event, as before that the object does not exists.
            $timeout(loadIntoDialogs, 0);
        };

        var saveDialogs = function () {
            // If dialog has not been loaded we shall not continue.
            if (!$scope.dialogs.loaded) {
                return;
            }
            var configurationObject = $scope.dialogs.api.getConfiguration();
            component['http://linkedpipes.com/ontology/configurationGraph'] = {
                '@id': $scope.configuration.uri
            };
            // Make sure the the configuration graph has the right name (IRI).
            configurationObject['@id'] = $scope.configuration.uri;
            data.model['graphs'][$scope.configuration.uri] = configurationObject;
        };

        $scope.onSave = function () {
            saveGeneral();
            saveDialogs();
            $mdDialog.hide();
        };

        $scope.onCancel = function () {
            $mdDialog.cancel();
        };

        // Load values that are not waiting.
        loadGeneral();
        loadConfiguration();
        loadDialogs();
    }
    controler.$inject = ['$scope', '$timeout', '$mdDialog', 'component', 'template', 'data'];
    //
    function init(app) {
        configurationHolderDirective(app);
        app.controller('components.pipelines.configuration.dialog', controler);
    }
    return init;
});