/**
 * Copyright (c) 2014, 2018, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
/*
 * Your profile ViewModel code goes here
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'appController', 'ojs/ojarraydataprovider', 'ojs/ojbutton', 'ojs/ojinputnumber'],
 function(oj, ko, $, app) {
  
    function MesaViewModel() {
      var self = this;
      getCategorias();
      self.headerConfig = {'viewName': 'header', 'viewModelFactory': app.getHeaderModel()};

      self.categorias=ko.observableArray(categorias);
      self.categoriaSeleccionada = ko.observable("Categorías");
      self.platosComanda = ko.observableArray();

      self.seleccionarCategoria = function(categoria){
        var idCategoria = categoria.id;
        self.categoriaSeleccionada(categoria.nombre);
        getPlatosCategoria(idCategoria);
        self.platosCategoria(platosCategoria);
      };

      self.añadirPlato = function(event, plato){
        self.borrar(plato);
        self.mesa.addPlato(plato);
        self.platosComanda(self.mesa.platos);
      };
      self.borrar = function(plato){
        var index = self.mesa.platos.indexOf(plato);
        if(index != -1){
          self.mesa.platos.splice(index, 1);
          self.platosComanda(self.mesa.platos);
        }
      };
      self.quit = function(event, plato){
        plato.unidades = 0;
        var index = self.mesa.platos.indexOf(plato);
        self.mesa.platos.splice(index, 1);
        self.platosComanda(self.mesa.platos);
      };

      self.precioTotal = ko.computed(function(){
        var total = 0;
        for(var i = 0; i < self.platosComanda().length; i++)
          total += (self.platosComanda()[i].precio * self.platosComanda()[i].unidades);
        return total;
      });

      self.confirmarComanda = function(event){
        var request = new XMLHttpRequest();
        request.open("post", "http://localhost:8080/Comandas/recibirComanda.jsp", false);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.onreadystatechange = function(){
          if(request.readyState==4 && request.status==200){
            var respuesta = JSON.parse(request.responseText);
            if (respuesta.resultado=="OK"){
              recibirComanda();
              self.mesa.platos = [] ;
              self.platosComanda(self.mesa.platos);
            }else{
              console.log("Ocurrió un error");
            }
          }
        };
        var p=JSON.stringify(self.mesa);
        request.send("p="+ p);
      }

      function recibirComanda(){
        var request = new XMLHttpRequest();
        request.open("post", "http://localhost:8080/Comandas/getEstadoMesa.jsp", false);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.onreadystatechange = function(){
          if(request.readyState==4 && request.status==200){
            var respuesta = JSON.parse(request.responseText);
            self.precio(respuesta.comanda.precio);
            self.platosConfirmados(respuesta.comanda.platos);
          }
        };
        var p = {
          id : self.mesa.id
        };
        request.send("p="+ JSON.stringify(p));
      };

      self.atras = function(){
        sessionStorage.mesaActual = null;
        platosCategoria = null;
        app.router.go("mesas");
      };

      self.cerrarMesa = function() {
        var idMesa = self.mesa.id;
        var estado = self.mesa.estado;
        var request=new XMLHttpRequest();
        if(estado=="Ocupada"){
          request.open("post", "http://localhost:8080/Comandas/cerrarMesa.jsp", false);
          request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
          request.onreadystatechange = function() {
            if (request.readyState==4 && request.status==200) {
              var respuesta=JSON.parse(request.responseText);
              if (respuesta.resultado=="OK") {
                sessionStorage.mesaActual = null;
                platosCategoria = null;
                getMesas();
                app.router.go("mesas");
              }else
                errores.innerHTML=respuesta.mensaje;
            }
          };
          var p = {
            _id : idMesa
          };
          request.send("p=" + JSON.stringify(p));
        }
      };

      self.handleActivated = function(info) { 
        self.mesa = JSON.parse(sessionStorage.mesaActual);
        self.mesa = new Mesa(self.mesa.id, self.mesa.estado);
        self.mesaActual=ko.observable(self.mesa);

        self.platosConfirmados = ko.observableArray();
        self.precio = ko.observable();
        recibirComanda();

        self.platosComanda(self.mesa.platos);

        self.platosCategoria=ko.observableArray(platosCategoria);
        self.platosCat = new oj.ArrayDataProvider(self.platosCategoria, {'idAttribute': 'id'});
        
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
    return new MesaViewModel();
  }
);
