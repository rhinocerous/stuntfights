(function() {
  'use strict';

  var svcObject = function (
    $baseHttpService
  , $entityService
  , $valueService
  , $attributeService
  )
  {
    var svc = this;

    $.extend( svc, $baseHttpService);

  //----------- dependencies ------------
    svc.$entityService = $entityService;
    svc.$valueService = $valueService;
    svc.$attributeService = $attributeService;

  //----------- members ------------
    svc.name = "record";
    svc.map = null;
    svc.entities = {};
    svc.attributes = {};
    svc.cb = null;

  //----------- public API ------------
    svc.get = _get;
    svc.ingest = _ingest;
    svc.create = _create;
    svc.getByEntityGroup = _getByEntityGroup;
    svc.updateValues = _updateValues;
    svc.getByWebsiteEntity = _getByWebsiteEntity;
    svc.addMedia = _addMedia;
    svc.addWebsite = _addWebsite;
    svc.addUser = _addUser;
    svc.recordMedia = _recordMedia;

  //----------- functions ------------

    function _recordMedia(recordId, mediaId, op, onSuccess, onError)
    {
      op = ('remove' == op) ? op : 'add';

      var url = "/" + svc.name + "/" + recordId + "/medias/" + op + "?id=" + mediaId;

      svc._executeRetrieve(url, onSuccess, onError);
    }

    function _updateValues(record, onSuccess, onError)
    {
      console.log("trying to update values", record);

      var url = "/" + svc.name + "/" + record.id + "/values";

      svc._executeUpdate(url, record, onSuccess, onError)
    }

    function _ingest(userId, data, cb)
    {
      svc.map = data;
      svc.cb = cb;

      angular.forEach(svc.map, function(records, slug) {

        if(svc.entities[slug])
        {
          console.log("got entity from cache", svc.entities[slug]);

          _create(svc.entities[slug], records, _onIngestValues);
        }
        else
        {
          svc.$entityService.getBySlug(slug, function(response){

              if(response.data)
              {
                svc.entities[slug] = response.data;

                _create(svc.entities[slug], records, _onIngestValues);
              }
          },
          svc._handleError)
        }
      });
    }

    function _addMedia(recordId, mediaId, onSuccess, onError)
    {
      //  have to use a different GET route here to work around windows bug: https://github.com/balderdashy/sails/issues/2787
      //  http://localhost:1337/entity/1/attributes/add?id=2
      var url = "/" + svc.name + "/" + recordId + "/medias/add?id=" + mediaId;

      svc._executeRetrieve(url, onSuccess, onError);
    }

    function _addWebsite(recordId, websiteId, onSuccess, onError)
    {
      var url = "/" + svc.name + "/" + recordId + "/website/add?id=" + websiteId;

      svc._executeRetrieve(url, onSuccess, onError);
    }

    function _addUser(recordId, userId, onSuccess, onError)
    {
      var url = "/" + svc.name + "/" + recordId + "/user/add?id=" + userId;

      svc._executeRetrieve(url, onSuccess, onError);
    }

    function _create(entity, records, website, onSuccess, onError)
    {
      angular.forEach(records, function(record, idx) {

        var req = {
          userId:svc.userId,
          order: record.order || 1000,
          entity:entity.id,
          values:[]
        };

        var url = "/" + svc.name + "/create";

        angular.forEach(record, function(val, key) {

          $attributeService.getBySlug(key, function(response){

            if(response.data)
            {
              var attr = response.data;

              req.values.push({
                attribute: attr.id,
                valString:val
              });

              if(Object.keys(req.values).length ==  Object.keys(record).length)
              {
                //console.log("fire create", req);

                svc._executeCreate(url, req, onSuccess, onError)
              }
            }
          });
        });
      });
    }

    function _checkProgress()
    {
      if(Object.keys(req.values).length == Object.keys(svc.outEntity).length
        && Object.keys(svc.attributes).length == Object.keys(svc.outAttr).length)
      {
        _mapAssociations();
        return true;
      } else {return false; }
    }

    function _onCreateRecord(response)
    {
      console.log("created record", response.data);
    }

    function _onIngestValues()
    {
      console.log("done ingesting");
    }

    function _getByWebsiteEntity(websiteId, entityId, onSuccess, onError)
    {
      var url = "/website/" + websiteId + "/entity/" + entityId + "/records";

      svc._executeRetrieve(url, onSuccess, onError)
    }

    function _getByEntityGroup(group, onSuccess, onError)
    {
      var url = "/entity/group/" + group + "/records";

      svc._executeRetrieve(url, onSuccess, onError)
    }

    function _get(id, onSuccess, onError)
    {
      var url = "/" + svc.name + "/" + id;

      svc._executeRetrieve(url, onSuccess, onError)
    }

    return svc;
  };

  angular.module(SATELLITE)
    .service('$recordService'
    , ["$baseHttpService", "$entityService","$valueService", "$attributeService", svcObject]
  );

})();
