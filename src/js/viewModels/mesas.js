/**
 * Copyright (c) 2014, 2018, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
/*
 * Your customer ViewModel code goes here
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'appController', 'viewModels/mesa', 'ojs/ojarraydataprovider', 'ojs/ojbutton'],
 function(oj, ko, $, app, m) {
  
    function MesasViewModel() {
      var self = this;
      
      getMesas();
      self.headerConfig = {'viewName': 'header', 'viewModelFactory': app.getHeaderModel()};
      self.errores = ko.observable("");
            
      self.seleccionarMesa = function(event, mesa) {
        var idMesa = mesa.id;
        var estado = mesa.estado;
        var request=new XMLHttpRequest();
        if(estado=="Libre"){
          request.open("post", "http://localhost:8080/Comandas/abrirMesa.jsp");
          request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
          request.onreadystatechange = function() {
            if (request.readyState==4 && request.status==200) {
              var respuesta=JSON.parse(request.responseText);
              if (respuesta.resultado=="OK") {
                getMesas();
                estado = mesas[idMesa-1].estado;
                if (estado=="Ocupada")
                  sessionStorage.mesaActual = JSON.stringify(mesas[idMesa-1]);
                app.router.go("mesa");
              }else
                self.errores(respuesta.mensaje);
            }
          };
          var p = {
            _id : idMesa
          };
          request.send("p=" + JSON.stringify(p));
        }else{
          sessionStorage.mesaActual = JSON.stringify(mesas[idMesa-1]);
          app.router.go("mesa");
        }
      }

      // Below are a subset of the ViewModel methods invoked by the ojModule binding
      // Please reference the ojModule jsDoc for additional available methods.

      /**
       * Optional ViewModel method invoked when this ViewModel is about to be
       * used for the View transition.  The application can put data fetch logic
       * here that can return a Promise which will delay the handleAttached function
       * call below until the Promise is resolved.
       * @param {Object} info - An object with the following key-value pairs:
       * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
       * @param {Function} info.valueAccessor - The binding's value accessor.
       * @return {Promise|undefined} - If the callback returns a Promise, the next phase (attaching DOM) will be delayed until
       * the promise is resolved
       */
      self.handleActivated = function(info) {
        // Implement if needed
        self.mesas=ko.observableArray(mesas);
        self.mesasYEstados = new oj.ArrayDataProvider(self.mesas, {'idAttribute': 'id'});
      };

      /**
       * Optional ViewModel method invoked after the View is inserted into the
       * document DOM.  The application can put logic that requires the DOM being
       * attached here.
       * @param {Object} info - An object with the following key-value pairs:
       * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
       * @param {Function} info.valueAccessor - The binding's value accessor.
       * @param {boolean} info.fromCache - A boolean indicating whether the module was retrieved from cache.
       */
      self.handleAttached = function(info) {
        // Implement if needed
      };


      /**
       * Optional ViewModel method invoked after the bindings are applied on this View. 
       * If the current View is retrieved from cache, the bindings will not be re-applied
       * and this callback will not be invoked.
       * @param {Object} info - An object with the following key-value pairs:
       * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
       * @param {Function} info.valueAccessor - The binding's value accessor.
       */
      self.handleBindingsApplied = function(info) {
        // Implement if needed
      };

      /*
       * Optional ViewModel method invoked after the View is removed from the
       * document DOM.
       * @param {Object} info - An object with the following key-value pairs:
       * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
       * @param {Function} info.valueAccessor - The binding's value accessor.
       * @param {Array} info.cachedNodes - An Array containing cached nodes for the View if the cache is enabled.
       */
      self.handleDetached = function(info) {
        // Implement if needed
      };
    }

    /*
     * Returns a constructor for the ViewModel so that the ViewModel is constructed
     * each time the view is displayed.  Return an instance of the ViewModel if
     * only one instance of the ViewModel is needed.
     */
    return new MesasViewModel();
  }
);
