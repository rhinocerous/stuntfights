(function() {
  'use strict';


  var vmObject = function (
    $scope
    , $baseController
    , $istuntService
    , $recordService
    , $entityService
    , $websitesService
    , $modal
    , $routeParams
  ) {

    var vm = this;

    $.extend(vm, $baseController);

    vm.$scope = $scope;
    vm.$istuntService = $istuntService;
    vm.$recordService = $recordService;
    vm.$entityService = $entityService;
    vm.$websitesService = $websitesService;
    vm.$modal = $modal;
    vm.$routeParams = $routeParams;

    vm.userId = 467;  //  TODO: manage this id and support multiple
    vm.website = null;
    vm.title = "Manage Values";
    vm.schemaString = null;
    vm.schemaRecords = null;
    vm.records = null;
    vm.selectedRecord = null;
    vm.selectedEntity = null;
    vm.entities = null;

    vm.import = _import;
    vm.selectRecord = _selectRecord;
    vm.createRecord = _createRecord;

    _init();

    function _init()
    {
      vm.$websitesService.getBySlug(vm.$routeParams.websiteSlug)
        .then(_getWebsiteSuccess, vm._handleError);
    }

    function _getWebsiteSuccess(response)
    {
      if(response && response.data && response.data.length)
      {
        vm.website = response.data[0];

        vm.$alertService.success(vm.website.name + " schema loaded");
      }
      else
      {
        vm.$alertService.warning("No website was loaded, please try again later");
      }
    }

    function _import()
    {
      vm.$istuntService.getResume(vm.userId, _onImportSuccess, _onImportError)
    }

    function _onGetEntityForCreate(response)
    {
      vm.selectedEntity = response.data;
      vm.selectedRecord = {};

      var modalInstance = vm.$modal.open({
        animation: true,
        templateUrl: '/templates/admin/modal/valuesAddRecord.html',
        controller: 'addRecordModalController as mc',
        size: 'lg',
        resolve: {
          record: function () {
            return vm.selectedRecord;
          },
          entity: function () {
            return vm.selectedEntity;
          },
          website: function () {
            return vm.website;
          }
        }
      });

      modalInstance.result.then(function (selectedRecord) {

        console.log("save data", selectedRecord);

        vm.$recordService.create(vm.selectedEntity, [selectedRecord], vm.website, _onCreateRecordsSuccess, vm._handleError);

        vm.selectedRecord = null;

      }, function () {

        vm.selectedRecord = null;
      });
    }

    function _createRecord(entity) {

      vm.$entityService.get(entity.id, _onGetEntityForCreate, vm._handleError);
    }

    function _selectRecord(record, entity) {

      vm.selectedEntity = entity;
      vm.selectedRecord = record;

      var modalInstance = vm.$modal.open({
        animation: true,
        templateUrl: '/templates/content/modalEdit.html',
        controller: 'modalRecordController as mc',
        size: 'lg',
        resolve: {
          record: function () {
            return vm.selectedRecord;
          },
          entity: function () {
            return vm.selectedEntity;
          }
        }
      });

      modalInstance.result.then(function (selectedRecord) {

        console.log("save data", selectedRecord);

        vm.$recordService.updateValues(selectedRecord, _onUpdateRecordsSuccess, _onImportError);

        vm.selectedRecord = null;

      }, function () {
        vm.selectedRecord = null;
      });
    }

    function _onCreateRecordsSuccess(response)
    {
      vm.$alertService.success("The record was created");

      _init();
    }

    function _onUpdateRecordsSuccess(response)
    {
      console.log("update success", response);

      _init();
    }

    function _onGetEntitiesSuccess(response)
    {
      vm.entities = response.data;

      vm.$alertService.success("Schema loaded");
    }

    function _onGetRecordsSuccess(response)
    {
      vm.records = response.data;
    }

    function _onImportSuccess(response)
    {
      vm.schemaString =  JSON.stringify(response.data, null,"    ");
      vm.schemaRecords = vm.$istuntService.parseResumeRecords(response.data);

      console.log("parsed records", vm.schemaRecords);

      vm.$recordService.ingest(vm.userId, vm.schemaRecords, _onIngestSuccess,_onImportError);
    }

    function _onIngestSuccess()
    {
      _init();
    }

    function _onImportError(err)
    {
      console.error("error importing records", err);
    }

  };

  angular.module(SATELLITE)
    .controller('websiteValuesController'
    , ['$scope', '$baseController', '$istuntService', '$recordService','$entityService', '$websitesService', '$modal', '$routeParams', vmObject]);

})();