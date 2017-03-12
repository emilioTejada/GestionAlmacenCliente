/*jslint browser:true, devel:true, white:true, vars:true */
/*global $:false, intel:false */

$(document).ready(function () {
    //getClientes();
   // getProductos();
});

$.datosProducto={};
$.datosProducto.ref="";
$.datosProducto.nombre="";
$.datosProducto.descripcion="";
$.datosProducto.cantidad="";



/**
* Creamos el objeto pedido y todos sus métodos.
*/
$.pedido={};
// Configuración del HOST y URL del servicio
$.pedido.HOST = $.conexion.HOST; 
$.pedido.URL = $.conexion.URL;
$.pedido.TABLA = "pedido";

$.listaPedidos = "";


/////////////////////////////////////////////



/*
* GET PEDIDO
*/
$.pedido.PedidoReadREST = function(dni) { 
        $.ajax({
            url: this.HOST+this.URL+this.TABLA,
            type: 'GET',
            dataType: 'json',
            success: function (json) {
                console.log(json);
                $.listaPedidos=json;  
                if (dni!==undefined){
                    $.cliente.pedidosRead (dni);
                }
            },
            error: function (xhr, status) {
                console.log('Disculpe, existió un problema');
            }
        });
    
};


//*******************************************************
/**
*   obtiene todos los pedidos del servidor
*/
$.pedido.PedidoReadREST();


/**
* muestra los productos de un pedido
*/
$.pedido.DetallePedido = function(id, fecha){
    if (fecha===undefined)
        fecha= $('#fila_pedidos_cliente_'+id).children('.fecha').html();
    else
        fecha=fecha.toLocaleDateString();
    $('#r_cliente_listado').hide();
    $('#c_nuevo_pedido').hide();
    $('#r_detalle_pedido').show();
    
    var cabecera1= $('<h2>Detalles del pedido </h2>');
    var cabecera2= $('<p>Cliente: '+$.datosPersona.nombre +' ' +$.datosPersona.apellidos+'</p>');
    
    var cabecera3= $('<p>Fecha: <span id="fecha_pedido">'+fecha+'</span></p>');
    var cabecera4= $('<p>ID Pedido : <span id="id_pedido">'+id+'</span></p>');
    
    $('#r_detalle_pedido').empty();
    $('#r_detalle_pedido').append(cabecera1);
    $('#r_detalle_pedido').append(cabecera2);
    $('#r_detalle_pedido').append(cabecera3);
    $('#r_detalle_pedido').append(cabecera4);

    var table = $('<table id="tabla_con_detalles_pedido"/>').addClass('table table-stripped');
    table.append($('<thead />').append($('<tr />').append('<th>id producto</th>', '<th>nombre</th>', '<th>cantidad</th>', '<th></th>')));
    var tbody = $('<tbody />');

    //uso de LISTAdetallesPEDIDOS
    for (var i=0; i<$.listaDetallePedidos.length;i++){
        if ($.listaDetallePedidos[i].idPedido.id==id){
          detalle= $.listaDetallePedidos[i];
          //var fechaFormateada = new Date(pedido.fecha);
          var filaNueva= ($(
              '<tr class="fila_detalle_pedido" id="fila_detalle_pedido_'+detalle.id+'" onclick="$.pedido.editarProducto('+detalle.id+')"/>').append('<td class="ref_producto">' + detalle.refProducto.ref + '</td>',
              '<td class="nombre">' + detalle.refProducto.nombre + '</td>',
              '<td class="cantidad">' + detalle.cantidad + '</td>'+
              '<td><button class="btn btn-danger" onclick="$.detalle_pedido.Delete(event,'+detalle.id+','+id+')">Eliminar</button></td>'));
        tbody.append(filaNueva);
        }
    }  
    table.append(tbody);
    $('#r_detalle_pedido').append( $('<div />').append(table) );
    
    var botonNuevo= $('<button class="btn btn-success" onclick="addProducto(2)">Añadir</button></td>');
    //$('#r_detalle_pedido').append(botonNuevo);
    var boton_volver=$('<button class="btn btn-danger" onclick="volverAlistadoPedidos()">Volver </button>')
    //$('#r_detalle_pedido').append(boton_volver);

    var filaBotones= $('<tr id="botones_detalle_pedido" style="text-align:center"/>');

    
    var celda= $('<td>');
    celda= $('<td colspan="2">').append(botonNuevo);
    filaBotones.append(celda);
    
    celda= $('<td colspan="2">').append(boton_volver);
    filaBotones.append(celda);
    tbody.append(filaBotones);

    
    $('.fila_detalle_pedido:odd').css('background','#CCCCCC');
}

function volverAlistadoPedidos(){
    $('#r_detalle_pedido').hide();
    $('#r_cliente_listado').show();
    $('#c_nuevo_pedido').hide();

    $('#r_detalle_pedido').empty();

    //borro las filas que había para mostrar los pedidos, y así actualizar tras la creación de un nuevo pedido
    $($(".cabecera_pedidos_cliente")).remove();
    $($(".cabecera1_pedidos_cliente")).remove();
    $($(".fila_pedidos_cliente")).remove();
    $($(".botones_listado_pedidos_cliente")).remove();
    
    
    $.pedido.PedidoReadREST($.datosPersona.dni);

}


/*
* CONFIGURAR PEDIDO (DEPRECIATED)
*/
$.pedido.ConfigurarPedido= function(pedido){
     
    $('#r_cliente_listado').hide();
    $('#r_detalle_pedido').hide();
    $('#c_nuevo_pedido').show();

    var cabecera1= $('<h2>Nuevo pedido </h2>');
    var cabecera2= $('<p>Cliente: '+$.datosPersona.nombre +' ' +$.datosPersona.apellidos+'</p>');
    var fechaFormateada = new Date(pedido.fecha);

    var cabecera3= $('<p>Fecha: <span id="fecha_nuevo_pedido>'+fechaFormateada.toLocaleDateString()+'</span></p>');
    var cabecera4= $('<p>ID Pedido : <span id="id_nuevo_pedido">'+pedido.id+'</span></p>');
    
    $('#c_nuevo_pedido').empty();
    $('#c_nuevo_pedido').append(cabecera1);
    $('#c_nuevo_pedido').append(cabecera2);
    $('#c_nuevo_pedido').append(cabecera3);
    $('#c_nuevo_pedido').append(cabecera4);

    
    var boton= $('<button class="btn btn-danger" onclick="addProducto()">Añadir</button></td>');
    
    $('#c_nuevo_pedido').append(boton);

    

}
/*
* muestra interfaz de elección de producto y elección de cantidad
*/
function addProducto(tipo){
    
    $('#botones_detalle_pedido').hide();
    
    
    var selectProducto = $('<select id="selectIdProducto" onchange="actualizarCantidad()" name="selectNameProducto" />');
    
    for (var i=0;i<$.listaProductos.length;i++){
      selectProducto.append(new Option($.listaProductos[i].nombre,$.listaProductos[i].ref));
    }
    
    var table = $('<table />').addClass('table table-stripped');
    table.append($('<thead />').append($('<tr />').append('<th>producto</th>', '<th>cantidad</th>', '<th>disponible</th>', '<th  style="width:40px" style="text-align:center">+</th>', '<th style="width:40px" style="text-align:center">-</th>')));
    var tbody = $('<tbody />');
    
    var filaNueva= $('<tr id="filaNuevaPedido">');
    var celda= $('<td>').append(selectProducto);

    
    filaNueva.append(celda);
    celda = $(
        '<td  id="cantidad_producto_nuevo_pedido">0</td>'+
        '<td id="disponible_producto_nuevo_pedido">'+"cc"+'</td>'+
        '<td style="width:40px"><button onclick="aumentar()" class="boton_cantidad btn-success">+</button></td>'+
        '<td style="width:40px"><button onclick="reducir()" class="boton_cantidad btn-info">-</button></td>');
    filaNueva.append(celda);  
    tbody.append(filaNueva);
    
    var botonOK= $('<button class="btn btn-success btnOK" onclick="$.pedido.ComprobarCantidad()">Añadir</button></td>');
    var botonCancel= $('<button class="btn btn-danger btnCancel" onclick="addCancelarProducto()">Cancelar</button></td>');
    
    var filaBotones= $('<tr style="text-align:center"/>');
    celda= $('<td colspan="5 ">').append(botonOK);
  //  filaBotones.append(celda);
    
    celda.append(botonCancel);
    filaBotones.append(celda);
    tbody.append(filaBotones);
 
    table.append(tbody);
    
    if (tipo==1){//nuevo pedido
        $('#c_nuevo_pedido').append( $('<div id="interfaz_nuevo_producto"/>').append(table) );
    } 
    if (tipo==2){ //edición de un pedido
        $('#r_detalle_pedido').append( $('<div id="interfaz_nuevo_producto"/>').append(table) );
    }
    actualizarCantidad();
}

/*
* muestra interfaz de para la edición de producto y elección de cantidad
*/
$.pedido.editarProducto = function(id_detalle_pedido){  //el id que paso es el del detallePedido(necesario para el update)
    $('#botones_detalle_pedido').hide();    
    
    //datos
    var RefProducto= $('#fila_detalle_pedido_'+id_detalle_pedido).children('.ref_producto').html();
    var nombreProducto= $('#fila_detalle_pedido_'+id_detalle_pedido).children('.nombre').html();
    var cantidadPedida= $('#fila_detalle_pedido_'+id_detalle_pedido).children('.cantidad').html();
    
    //componentes
    var NombreProducto = $('<input id="Edicion_NombreProducto" readonly value="'+nombreProducto+'"/>');
    
    var idProducto = $('<span id="Edicion_Id_Producto" style="display:none">'+RefProducto+'</span>');//invisible
    
    
    var table = $('<table />').addClass('table table-stripped');
    table.append($('<thead />').append($('<tr />').append('<th>producto</th>', '<th>cantidad</th>', '<th>disponible</th>', '<th  style="width:40px" style="text-align:center">+</th>', '<th style="width:40px" style="text-align:center">-</th>')));
    var tbody = $('<tbody />');
    
    var filaNueva= $('<tr id="Edicion_filaNuevaPedido">');
    var celda= $('<td>').append(NombreProducto);
    
    filaNueva.append(celda);
    celda = $(
        '<td id="Edicion_cantidad_producto_nuevo_pedido">'+cantidadPedida+'</td>'+
        '<td id="Edicion_disponible_producto_nuevo_pedido">'+"cc"+'</td>'+
        '<td style="width:40px"><button onclick="Edicion_aumentar()" class="boton_cantidad btn-success">+</button></td>'+
        '<td style="width:40px"><button onclick="Edicion_reducir()" class="boton_cantidad btn-info">-</button></td>');
    filaNueva.append(celda);  
    tbody.append(filaNueva);
    
    var botonOK= $('<button class="btn btn-success btnOK" onclick="$.pedido.Edicion_ComprobarCantidad()">Añadir</button></td>');
    var botonCancel= $('<button class="btn btn-danger btnCancel" onclick="addCancelarProducto()">Cancelar</button></td>');
    var filaBotones= $('<tr style="text-align:center"/>');
    celda= $('<td colspan="5">').append(botonOK);
    //filaBotones.append(celda);
    
    celda.append(botonCancel);
    filaBotones.append(celda);
    tbody.append(filaBotones);
 
    table.append(tbody);
    
    $('#r_detalle_pedido').append( $('<div id="interfaz_nuevo_producto"/>').append(table) );
    $('#r_detalle_pedido').append(idProducto);
    Edicion_actualizarCantidad();
}


/**FUNCIONES AUXILIARES PARA LA ADICIÓN DE UN NUEVO PRODUCTO AL PEDIDO**/
$.pedido.ComprobarCantidad = function (){
    
    if (parseInt($('#cantidad_producto_nuevo_pedido').html())>0)
        $.detalle_pedido.detallePedidoCreate();
    else
        alert("Debes elegir alguna unidad");
}

function addCancelarProducto(){
    $('#interfaz_nuevo_producto').remove();
    $('#botones_detalle_pedido').show();

}

function actualizarCantidad(){
    var ref_producto =$($('#filaNuevaPedido select')).val();
    $('#disponible_producto_nuevo_pedido').html($.producto.Disponible(ref_producto));    
    $.producto.ObtenerDeListado(ref_producto);
};

function aumentar(){
    var disponible=parseInt($('#disponible_producto_nuevo_pedido').html());
    var peticion=parseInt($('#cantidad_producto_nuevo_pedido').html());
    
    if (disponible>peticion){        
        $('#cantidad_producto_nuevo_pedido').html((peticion+1).toString());
    }
}

function reducir(){
    var peticion= parseInt($('#cantidad_producto_nuevo_pedido').html());
    if (peticion>0){        
        $('#cantidad_producto_nuevo_pedido').html((peticion-1).toString());
    }
}


/**FUNCIONES AUXILIARES PARA LA EDICIÓN DE UN PRODUCTO DEL PEDIDO**/
$.pedido.Edicion_ComprobarCantidad = function (){
    
    if (parseInt($('#Edicion_cantidad_producto_nuevo_pedido').html())>0)
        $.detalle_pedido.detallePedidoUpdate();     ////////////////////////////////////////////////////////hacer
    else
        alert("Debes elegir alguna unidad");
}

function Edicion_addCancelarProducto(){
    $('#interfaz_nuevo_producto').remove();
    $('#botones_detalle_pedido').show();    
}

function Edicion_actualizarCantidad(){
    var ref_producto =$('#Edicion_Id_Producto').html();
    $('#Edicion_disponible_producto_nuevo_pedido').html($.producto.Disponible(ref_producto));    
    $.producto.ObtenerDeListado(ref_producto);
};

function Edicion_aumentar(){
    var disponible=parseInt($('#Edicion_disponible_producto_nuevo_pedido').html());
    var peticion=parseInt($('#Edicion_cantidad_producto_nuevo_pedido').html());
    
    if (disponible>peticion){        
        $('#Edicion_cantidad_producto_nuevo_pedido').html((peticion+1).toString());
    }
}

function Edicion_reducir(){
    var peticion= parseInt($('#Edicion_cantidad_producto_nuevo_pedido').html());
    if (peticion>0){        
        $('#Edicion_cantidad_producto_nuevo_pedido').html((peticion-1).toString());
    }
}




/*
* CREATE PEDIDO
*/
$.pedido.PedidoCreateREST = function(){
    // Leemos los datos del formulario pidiendo a jQuery que nos de el valor de cada input.
    var cliente = {
        'dni' : $.datosPersona.dni,
        'nombre' : $.datosPersona.nombre,
        'apellidos': $.datosPersona.apellidos,
        'direccion': $.datosPersona.direccion
    };
    
    var fecha= new Date(Date.now())
    //var fechaFormateada= fecha.getFullYear() + "-"+ (fecha.getMonth()+1) +"-"+fecha.getDate()+"T00:00:00+01:00";
    
    var datos ={
        'dniCliente': cliente,
        'fecha': fecha
    }
    
    $.ajax({
        url: this.HOST+this.URL+this.TABLA,
        type: 'POST',
        dataType: 'json',
        contentType: "application/json",
        data: JSON.stringify(datos),
        success: function(result,status,jqXHR ) {
           // probamos que se ha actualizado cargando de nuevo la lista -no es necesario-
           // $.cliente.PedidoReadREST();
            console.log(result);
            //$.pedido.ConfigurarPedido(result);  //PRIMERA FORMA DE HACERLO. ES MEJOR REUTILIZAR LA DE EDITADO DE PEDIDO
            $.pedido.DetallePedido(result.id,fecha);//mando la id del pedido que acabo de crear
        },
        error: function(jqXHR, textStatus, errorThrown){
            $.cliente.error('Error: Pedido Create','No ha sido posible crear el cliente. Compruebe su conexión.');
        }
    });

    // esto es para que no vaya hacia atrás (que no salga el icono volver atrás en la barra de menú) 
    $.afui.clearHistory();
    // cargamos el panel con dni r_cliente.
    $.afui.loadContent("#r_cliente",false,false,"up");
    ;
    
};


/*
*   ELIMINAR PEDIDO
*/
$.pedido.EliminarPedido= function(event,id,dni){
    $($(".cabecera_pedidos_cliente")).remove();
    $($(".cabecera1_pedidos_cliente")).remove();
    $($(".fila_pedidos_cliente")).remove();
    $($(".botones_listado_pedidos_cliente")).remove();
    
    event.stopPropagation();
     $.ajax({
            url: this.HOST+this.URL+this.TABLA+"/"+id,
            type: 'DELETE',
            dataType: 'json',
            contentType: "application/json",
            // data: JSON.stringify(datos),
            success: function(result,status,jqXHR ) {
                console.log(result);
                $.pedido.PedidoReadREST(dni);
                alert ("Eliminando pedido");
            },
            error: function(jqXHR, textStatus, errorThrown){
                $.cliente.error('Error: Cliente Delete','No ha sido posible borrar el cliente. Compruebe su conexión.');
            }
     })
}

