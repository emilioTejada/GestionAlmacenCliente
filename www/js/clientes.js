/*jslint browser:true, devel:true, white:true, vars:true */
/*global $:false, intel:false */

$.datosPersona={};
$.datosPersona.nombre="";
$.datosPersona.apellidos="";
$.datosPersona.direccion="";
$.datosPersona.dni="";


/**
* Creamos el objeto cliente y todos sus métodos.
*/
$.cliente={};
$.cliente.HOST =$.conexion.HOST;
$.cliente.URL = $.conexion.URL;
$.cliente.TABLA= "cliente";
/*
* GET CLIENTES
*/
$.cliente.ClienteReadREST = function(soloDatos) {
        $.ajax({
            url: this.HOST+this.URL+this.TABLA,
            type: 'GET',
            dataType: 'json',
            success: function (json) {
                console.log(json);
                 if ( soloDatos === undefined )
                    pintarClientes(json);
                $.producto.ProductoReadREST_JSON(); //guardo los productos para si los necesito para un pedido
                return json;
            },
            error: function (xhr, status) {
                console.log('Disculpe, existió un problema');
            }
        });
    
    
};

function pintarClientes(json){
    $('#r_cliente_listado').empty();
    $('#r_cliente_listado').append('<h3>Listado de Clientes</h3>');
    var table = $('<table />').addClass('table table-stripped');
    table.append($('<thead />').append($('<tr />').append('<th>dni</th>', '<th>nombre</th>', '<th>apellidos</th>','<th>dirección</th>')));
    var tbody = $('<tbody />');

    for (var cliente in json) {
      //tbody.append($('<tr />').append('<td>' + json[cliente].dni + '</td>','<td>' + json[cliente].nombre + '</td>', '<td>' + json[cliente].apellidos + '</td>', '<td>' + json[cliente].direccion + '</td>'));
//////////////////////////////////////////////////////////////////////////////////////////////////////////////me he quedado aqui        
      tbody.append($('<tr class="fila_listado_cliente" id="fila_listado_cliente_'+json[cliente].dni+'" onclick="$.cliente.pedidosRead('+("'".concat(json[cliente].dni.concat("'"))).trim()+')"/>').append('<td class="dni">' + json[cliente].dni + '</td>','<td class="nombre">' + json[cliente].nombre + '</td>', '<td class="apellidos">' + json[cliente].apellidos + '</td>', '<td class="direccion">' + json[cliente].direccion + '</td>'));
      
    }
    table.append(tbody);
    $('#r_cliente_listado').append( $('<div />').append(table) );
    $('.fila_listado_cliente:odd').css('background','#CCCCCC');
}

//GESTIÓN PEDIDOS//////////////////////////////////////////////////////////////////////////////////////
$.cliente.pedidosRead = function (dni){
    var fila = $("#fila_listado_cliente_"+arguments[0]);
    
    $.cliente.capturarDatosCliente(fila);
    
    
    var replegar = Boolean;
    if (fila.next().attr('class')=="cabecera1_pedidos_cliente")
       replegar=true; 
     else
        replegar=false;

    $($(".cabecera_pedidos_cliente")).remove();
    $($(".cabecera1_pedidos_cliente")).remove();
    $($(".fila_pedidos_cliente")).remove();
    $($(".botones_listado_pedidos_cliente")).remove();

    
    if(!replegar){
        var cabecera2 = ($('<tr class="cabecera_pedidos_cliente fila_pedido"/>').append('<td>id</td>', '<td colspan="2">fecha</td>','<td></td>'));
        cabecera2.insertAfter(fila);
        var cabecera1 = ($('<tr class="cabecera1_pedidos_cliente"/>').append('<td colspan="4">Pedidos realizados</td>'));
        cabecera1.insertAfter(fila); 
    
        var ultimafila = $('<tr class="botones_listado_pedidos_cliente"/>').append('<td colspan="4"> <button class="btn btn-danger" onclick="$.pedido.PedidoCreateREST()">Nuevo pedido </button></td>');
        
        ultimafila.insertAfter(cabecera2);
           
        //uso de LISTAPEDIDOS
        for (var i=$.listaPedidos.length-1;i>=0;i--){
            if ($.listaPedidos[i].dniCliente.dni==dni){
              pedido= $.listaPedidos[i];
              var fechaFormateada = new Date(pedido.fecha);
              var fechaString= fechaFormateada.toLocaleDateString();
              var filaNueva= (
                  $('<tr class="fila_pedidos_cliente fila_pedido" id="fila_pedidos_cliente_'+pedido.id+'" onclick="$.pedido.DetallePedido('+pedido.id+')"/>').append('<td>' + pedido.id + '</td>','<td class="fecha" colspan="2">' + fechaFormateada.toLocaleDateString() + '</td>'+
                '<td><button class="btn btn-danger" onclick="$.pedido.EliminarPedido(event,'+pedido.id+','+("'".concat(dni.concat("'"))).trim()+')">Eliminar</button></td>'));
            filaNueva.insertAfter(cabecera2);
            }
        }                    
    }
    //$('tr.fila_pedidos_cliente:odd').css('background','#CC00CC');
}

$.cliente.capturarDatosCliente= function(fila){
    $.datosPersona.nombre= fila.children('.nombre').html();
    $.datosPersona.apellidos= fila.children('.apellidos').html();
    $.datosPersona.dni= fila.children('.dni').html();
    $.datosPersona.direccion= fila.children('.direccion').html();
}



/*
* CREATE CLIENTE
*/
$.cliente.ClienteCreateREST = function(){
    // Leemos los datos del formulario pidiendo a jQuery que nos de el valor de cada input.
    var datos = {
        'dni' : $("#c_cl_dni").val(),
        'nombre' : $("#c_cl_nombre").val(),
        'apellidos': $("#c_cl_apellidos").val(),
        'direccion': $("#c_cl_direccion").val()

    };
    
    // comprobamos que en el formulario haya datos...
    if ( datos.nombre.length>2 && datos.apellidos.length>2 ) {
        $.ajax({
            url: $.cliente.HOST+$.cliente.URL+this.TABLA,
            type: 'POST',
            dataType: 'json',
            contentType: "application/json",
            data: JSON.stringify(datos),
            success: function(result,status,jqXHR ) {
               // probamos que se ha actualizado cargando de nuevo la lista -no es necesario-
                $.cliente.ClienteReadREST();
            },
            error: function(jqXHR, textStatus, errorThrown){
                $.cliente.error('Error: Cliente Create','No ha sido posible crear el cliente. Compruebe su conexión.');
            }
        });
        
        // esto es para que no vaya hacia atrás (que no salga el icono volver atrás en la barra de menú) 
        $.afui.clearHistory();
        // cargamos el panel con dni r_cliente.
        $.afui.loadContent("#r_cliente",false,false,"up");
    }
    
};

/*
    BORRADO DE CLIENTE
    Crea un desplegable, un select, con todos los clientes del servicio para seleccionar el cliente a eliminar
*/
$.cliente.ClienteDeleteREST = function(dni){
    // si pasamos el ID directamente llamamos al servicio DELETE
    // si no, pintamos el formulario de selección para borrar.
    if ( dni !== undefined ) {
        dni = $('#d_cl_sel').val();
        console.log(dni);
        $.ajax({
            url: $.cliente.HOST+$.cliente.URL+this.TABLA+"/"+dni,
            type: 'DELETE',
            dataType: 'json',
            contentType: "application/json",
            // data: JSON.stringify(datos),
            success: function(result,status,jqXHR ) {
               // probamos que se ha actualizado cargando de nuevo la lista -no es necesario-
                $.cliente.ClienteReadREST();
                // esto es para que no vaya hacia atrás (que no salga el icono volver atrás en la barra de menú) 
                $.afui.clearHistory();
                // cargamos el panel con dni r_cliente.
                $.afui.loadContent("#r_cliente",false,false,"up");
            },
            error: function(jqXHR, textStatus, errorThrown){
                $.cliente.error('Error: Cliente Delete','No ha sido posible borrar el cliente. Compruebe su conexión.');
            }
        });    
    } else{
        $.ajax({
            url: this.HOST+this.URL+this.TABLA,
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            success: function (json) {
                $('#d_cliente').empty();
                var formulario = $('<div />');
                formulario.addClass('container');
                var div_select = $('<div />');
                div_select.addClass('form-group');
                var select = $('<select id="d_cl_sel"/>');
                select.addClass('form-group');
                for (var clave in json){
                    select.append('<option value="'+json[clave].dni+'">'+json[clave].nombre+' ' + json[clave].apellidos+'</option>');
                }
                formulario.append(select);
                formulario.append('<div class="form-group"></div>').append('<button class="btn btn-danger" onclick="$.cliente.ClienteDeleteREST(1)"> eliminar! </button>');
                $('#d_cliente').append(formulario);
            },
            error: function(jqXHR, textStatus, errorThrown){
                $.cliente.error('Error: Cliente Delete','No ha sido posible conectar al servidor. Compruebe su conexión.');
            }
        });
    }
    
};

/**
    Función para la gestión de actualizaciones. Hay tres partes: 
    1) Listado 
    2) Formulario para modificación
    3) Envío de datos al servicio REST (PUT)
*/

$.cliente.ClienteUpdateREST = function(dni, envio){
    if ( dni === undefined ) {
        $.ajax({
            url: this.HOST+this.URL+this.TABLA,
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            success: function (json) {
                $('#u_cliente').empty();
                $('#u_cliente').append('<h3>Pulse sobre un cliente</h3>');
                var table = $('<table />').addClass('table table-stripped');

                table.append($('<thead />').append($('<tr />').append('<th>dni</th>', '<th>nombre</th>', '<th>apellidos</th>', '<th>direccion</th>')));
                var tbody = $('<tbody />');
                for (var clave in json) {
                    // le damos a cada fila un ID para luego poder recuperar los datos para el formulario en el siguiente paso
                    tbody.append($('<tr class="fila_update_cliente" id="fila_'+json[clave].dni+'" onclick="$.cliente.ClienteUpdateREST('+("'".concat(json[clave].dni.concat("'"))).trim()+')"/>').append('<td>' + json[clave].dni + '</td>',
                    '<td>' + json[clave].nombre + '</td>', '<td>' + json[clave].apellidos + '</td>', '<td>' + json[clave].direccion + '</td>'));
                }
                table.append(tbody);

                $('#u_cliente').append( $('<div />').append(table) );
                $('.fila_update_cliente:odd').css('background','#CCCCCC');
            },
            error: function (xhr, status) {
                $.cliente.error('Error: Cliente Update','Ha sido imposible conectar al servidor.');
            }
        });
    } else if (envio === undefined ){
        var seleccion = ("#fila_".concat(dni))+" td";
        var cl_dni = ($(seleccion))[0];
        var cl_nombre = ($(seleccion))[1];
        var cl_apellidos = ($(seleccion))[2];
        var cl_direccion = ($(seleccion))[3];

        
        $("#u_cl_dni").val(cl_dni.childNodes[0].data);
        $("#u_cl_nombre").val(cl_nombre.childNodes[0].data);
        $("#u_cl_apellidos").val(cl_apellidos.childNodes[0].data);
        $("#u_cl_direccion").val(cl_direccion.childNodes[0].data);

        // esto es para que no vaya hacia atrás (que no salga el icono volver atrás en la barra de menú) 
        $.afui.clearHistory();
        // cargamos el panel con dni r_cliente.
        $.afui.loadContent("#uf_cliente",false,false,"up");
    } else {
        //HACEMOS LA LLAMADA REST
            var datos = {
                'dni' : $("#u_cl_dni").val(),
                'nombre' : $("#u_cl_nombre").val(),
                'apellidos': $("#u_cl_apellidos").val(),
                'direccion': $("#u_cl_direccion").val()

            };

            // comprobamos que en el formulario haya datos...
            if ( datos.nombre.length>2 && datos.apellidos.length>2 ) {
                $.ajax({
                    url: $.cliente.HOST+$.cliente.URL+this.TABLA+"/"+$("#u_cl_dni").val(),
                    type: 'PUT',
                    dataType: 'json',
                    contentType: "application/json",
                    data: JSON.stringify(datos),
                    success: function(result,status,jqXHR ) {
                       // probamos que se ha actualizado cargando de nuevo la lista -no es necesario-
                        $.cliente.ClienteReadREST();
                    },
                    error: function(jqXHR, textStatus, errorThrown){
                        $.cliente.error('Error: Cliente Create','No ha sido posible crear el cliente. Compruebe su conexión.');
                    }
                });

                // esto es para que no vaya hacia atrás (que no salga el icono volver atrás en la barra de menú) 
                $.afui.clearHistory();
                // cargamos el panel con dni r_cliente.
                $.afui.loadContent("#r_cliente",false,false,"up");
            }
    }
};


/**
    Función para la gestión de errores y mensajes al usuario
*/
$.cliente.error = function(title, msg){
    $('#err_cliente').empty();
    $('#err_cliente').append('<h3>'+title+'</h3>');
    $('#err_cliente').append('<p>'+msg+'</p>');
    // esto es para que no vaya hacia atrás (que no salga el icono volver atrás en la barra de menú) 
    $.afui.clearHistory();
    // cargamos el panel con dni r_cliente.
    $.afui.loadContent("#err_cliente",false,false,"up");
};