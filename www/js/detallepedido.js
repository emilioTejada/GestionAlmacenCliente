/*jslint browser:true, devel:true, white:true, vars:true */
/*global $:false, intel:false */

$(document).ready(function () {
    //getClientes();
   // getProductos();
});
/**
* Creamos el objeto pedido y todos sus métodos.
*/
$.detalle_pedido={};
// Configuración del HOST y URL del servicio
$.detalle_pedido.HOST = $.conexion.HOST; 
$.detalle_pedido.URL = $.conexion.URL;
$.detalle_pedido.TABLA = "detallepedido";

$.listaDetallePedidos = "";


/*
* GET DETALLEPEDIDO
*/
$.detalle_pedido.DetallePedidoReadREST = function(id_pedido) { 
        $.ajax({
            url: this.HOST+this.URL+this.TABLA,
            type: 'GET',
            dataType: 'json',
            success: function (json) {
                console.log(json);
                $.listaDetallePedidos=json; 
                
                if (id_pedido!==undefined){ //pintamos los resultados
                   $.pedido.DetallePedido(id_pedido);

                }
            },
            error: function (xhr, status) {
                console.log('Disculpe, existió un problema');
            }
        });
    
};

$.detalle_pedido.DetallePedidoReadREST();


/*
* CREATE DETALLEPEDIDO
*/
$.detalle_pedido.detallePedidoCreate = function(){
    // Leemos los datos del formulario pidiendo a jQuery que nos de el valor de cada input.
    var ref= $('#selectIdProducto').val();
    $.producto.ObtenerDeListado(ref);

    var cliente = {
        'dni' : $.datosPersona.dni,
        'nombre' : $.datosPersona.nombre,
        'apellidos': $.datosPersona.apellidos,
        'direccion': $.datosPersona.direccion
    };
    
     var producto = {
        'ref' : $.datosProducto.ref,
        'nombre' : $.datosProducto.nombre,
        'descripcion': $.datosProducto.descripcion,
        'cantidad': $.datosProducto.cantidad
    };
    var id_pedido=$('#id_pedido').html();
    var pedido={
        'dniCLiente': cliente,
        'fecha': fecha,
        'id': id_pedido
    }
    
    var cantidad_peticion=parseInt($('#cantidad_producto_nuevo_pedido').html());
    var nuevaCantidad= $.datosProducto.cantidad- cantidad_peticion;

    var fecha= $('#fecha_pedido').html();


    //var fechaFormateada= fecha.getFullYear() + "-"+ (fecha.getMonth()+1) +"-"+fecha.getDate()+"T00:00:00+01:00";
    
    var datos ={
        'cantidad':cantidad_peticion,
        'idPedido': pedido,
        'refProducto': producto
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
            $('#interfaz_nuevo_producto').remove();
            $.producto.ProductoUpdateREST_cantidad(producto,nuevaCantidad);
            $.detalle_pedido.DetallePedidoReadREST(id_pedido, fecha);
            console.log(result);
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
* borrado de detallepedido
*/
$.detalle_pedido.Delete= function(event,id_detalle_pedido, id_pedido){
    
    var ref_producto= $('#fila_detalle_pedido_'+id_detalle_pedido).children('.ref_producto').html();
    var cantidadSumar =$('#fila_detalle_pedido_'+id_detalle_pedido).children('.cantidad').html();
    
    event.stopPropagation();
    
     $.ajax({
        url: this.HOST+this.URL+this.TABLA+"/"+id_detalle_pedido,
        type: 'DELETE',
        dataType: 'json',
        contentType: "application/json",
        // data: JSON.stringify(datos),
        success: function(result,status,jqXHR ) {
            console.log(result);
            $.producto.ProductoSumar_cantidad(ref_producto,cantidadSumar);
            $.detalle_pedido.DetallePedidoReadREST(id_pedido);

        },
        error: function(jqXHR, textStatus, errorThrown){
            $.cliente.error('Error: DetallePedido Delete','No ha sido posible borrar el Detalle Pedido. Compruebe su conexión.');
        }
     })
}