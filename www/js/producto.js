/*jslint browser:true, devel:true, white:true, vars:true */
/*global $:false, intel:false */


/**
* Creamos el objeto producto y todos sus métodos.
*/
$.producto={};
// Configuración del HOST y URL del servicio
$.producto.HOST = $.conexion.HOST;
$.producto.URL = $.conexion.URL;
$.producto.TABLA= "producto";

$.listaProductos = "";

/*
* GET PRODUCTOS
*/
$.producto.ProductoReadREST = function() {
        $.ajax({
            url: this.HOST+this.URL+this.TABLA,
            type: 'GET',
            dataType: 'json',
            success: function (json) {
                $.listaProductos=json;

                $('#r_producto').empty();
                $('#r_producto').append('<h3>Listado de Productos</h3>');
                var table = $('<table />').addClass('table table-stripped');
                table.append($('<thead />').append($('<tr />').append('<th>ref</th>', '<th>nombre</th>', '<th>descripción</th>','<th>cantidad</th>')));
                var tbody = $('<tbody />');
                
                for (var producto in json) {
                    tbody.append($('<tr class="fila_listado_productos" />').append('<td>' + json[producto].ref + '</td>','<td>' + json[producto].nombre + '</td>', '<td>' + json[producto].descripcion + '</td>', '<td>' + json[producto].cantidad + '</td>'));
                }
                table.append(tbody);
                $('#r_producto').append( $('<div />').append(table) );
                $('.fila_listado_productos:odd').css('background','#CCCCCC');
            },
            error: function (xhr, status) {
                console.log('Disculpe, existió un problema');
            }
        });
    
};


/*
* GET PRODUCTOS
*/
$.producto.ProductoReadREST_JSON = function() {
        $.ajax({
            url: this.HOST+this.URL+this.TABLA,
            type: 'GET',
            dataType: 'json',
            success: function (json) {
                $.listaProductos=json;
            },
            error: function (xhr, status) {
                console.log('Disculpe, existió un problema');
            }
        });
    
};



/*
* CREATE PRODUCTO
*/
$.producto.ProductoCreateREST = function(){
    // Leemos los datos del formulario pidiendo a jQuery que nos de el valor de cada input.
    var datos = {
        'ref' : $("#c_pr_ref").val(),
        'nombre' : $("#c_pr_nombre").val(),
        'descripcion': $("#c_pr_descripcion").val(),
        'cantidad': $("#c_pr_cantidad").val()

    };
    
    // comprobamos que en el formulario haya datos...
    if ( datos.nombre.length>2 && datos.ref.length>0 ) {
        $.ajax({
            url: $.producto.HOST+$.producto.URL+this.TABLA,
            type: 'POST',
            dataType: 'json',
            contentType: "application/json",
            data: JSON.stringify(datos),
            success: function(result,status,jqXHR ) {
                console.log("exito");
               // probamos que se ha actualizado cargando de nuevo la lista -no es necesario-
                $.producto.ProductoReadREST();
            },
            error: function(jqXHR, textStatus, errorThrown){
                $.producto.error('Error: Producto Create','No ha sido posible crear el producto. Compruebe su conexión.');
            }
        });
        
        // esto es para que no vaya hacia atrás (que no salga el icono volver atrás en la barra de menú) 
        $.afui.clearHistory();
        // cargamos el panel con ref r_producto
        $.afui.loadContent("#r_producto",false,false,"up");
    }
    
};

/*
    BORRADO DE PRODUCTO
    Crea un desplegable, un select, con todos los productos del servicio para seleccionar el producto a eliminar
*/
$.producto.ProductoDeleteREST = function(ref){
    // si pasamos el ref directamente llamamos al servicio DELETE
    // si no, pintamos el formulario de selección para borrar.
    if ( ref !== undefined ) {
        ref = $('#d_pr_sel').val();
        console.log(ref);
        $.ajax({
            url: $.producto.HOST+$.producto.URL+this.TABLA+'/'+ref,
            type: 'DELETE',
            dataType: 'json',
            contentType: "application/json",
            // data: JSON.stringify(datos),
            success: function(result,status,jqXHR ) {
               // probamos que se ha actualizado cargando de nuevo la lista -no es necesario-
                $.producto.ProductoReadREST();
                // esto es para que no vaya hacia atrás (que no salga el icono volver atrás en la barra de menú) 
                $.afui.clearHistory();
                // cargamos el panel con ref r_producto.
                $.afui.loadContent("#r_producto",false,false,"up");
            },
            error: function(jqXHR, textStatus, errorThrown){
                $.producto.error('Error: Producto Delete','No ha sido posible borrar el producto. Compruebe su conexión.');
            }
        });    
    } else{
        $.ajax({
            url: this.HOST+this.URL+this.TABLA,
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            success: function (json) {
                $('#d_producto').empty();
                var formulario = $('<div />');
                formulario.addClass('container');
                var div_select = $('<div />');
                div_select.addClass('form-group');
                var select = $('<select id="d_pr_sel"/>');
                select.addClass('form-group');
                for (var clave in json){
                    select.append('<option value="'+json[clave].ref+'">'+json[clave].nombre+' ' + json[clave].descripcion+'</option>');
                }
                formulario.append(select);
                formulario.append('<div class="form-group"></div>').append('<button class="btn btn-danger" onclick="$.producto.ProductoDeleteREST(1)"> eliminar! </button>');
                $('#d_producto').append(formulario);
            },
            error: function(jqXHR, textStatus, errorThrown){
                $.producto.error('Error: Producto Delete','No ha sido posible conectar al servidor. Compruebe su conexión.');
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

$.producto.ProductoUpdateREST = function(ref, envio){
    if ( ref === undefined ) {
        $.ajax({
            url: this.HOST+this.URL+this.TABLA,
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            success: function (json) {
                $('#u_producto').empty();
                $('#u_producto').append('<h3>Pulse sobre un producto</h3>');
                var table = $('<table />').addClass('table table-stripped');

                table.append($('<thead />').append($('<tr />').append('<th>ref</th>', '<th>nombre</th>', '<th>descripción</th>', '<th>cantidad</th>')));
                var tbody = $('<tbody />');
                for (var clave in json) {
                    // le damos a cada fila un ID para luego poder recuperar los datos para el formulario en el siguiente paso
                    tbody.append($('<tr class="fila_update_producto" id="fila_'+json[clave].ref+'" onclick="$.producto.ProductoUpdateREST('+json[clave].ref+')"/>').append('<td>' + json[clave].ref + '</td>',
                    '<td>' + json[clave].nombre + '</td>', '<td>' + json[clave].descripcion + '</td>', '<td>' + json[clave].cantidad + '</td>'));
                }
                table.append(tbody);

                $('#u_producto').append( $('<div />').append(table) );
                $('.fila_update_producto:odd').css('background','#CCCCCC');
            },
            error: function (xhr, status) {
                $.producto.error('Error: Producto Update','Ha sido imposible conectar al servidor.');
            }
        });
    } else if (envio === undefined ){
        var seleccion = ("#fila_".concat(ref))+" td";
        var pr_ref = ($(seleccion))[0];
        var pr_nombre = ($(seleccion))[1];
        var pr_descripcion = ($(seleccion))[2];
        var pr_cantidad = ($(seleccion))[3];

        
        $("#u_pr_ref").val(pr_ref.childNodes[0].data);
        $("#u_pr_nombre").val(pr_nombre.childNodes[0].data);
        $("#u_pr_descripcion").val(pr_descripcion.childNodes[0].data);
        $("#u_pr_cantidad").val(pr_cantidad.childNodes[0].data);

        // esto es para que no vaya hacia atrás (que no salga el icono volver atrás en la barra de menú) 
        $.afui.clearHistory();
        // cargamos el panel con ref r_producto.
        $.afui.loadContent("#uf_producto",false,false,"up");
    } else {
        //HACEMOS LA LLAMADA REST
            var datos = {
                'ref' : $("#u_pr_ref").val(),
                'nombre' : $("#u_pr_nombre").val(),
                'descripcion': $("#u_pr_descripcion").val(),
                'cantidad': $("#u_pr_cantidad").val()

            };

            // comprobamos que en el formulario haya datos...
            if ( datos.nombre.length>2 && datos.ref.length>0 ) {
                $.ajax({
                    url: $.producto.HOST+$.producto.URL+this.TABLA+"/"+$("#u_pr_ref").val(),
                    type: 'PUT',
                    dataType: 'json',
                    contentType: "application/json",
                    data: JSON.stringify(datos),
                    success: function(result,status,jqXHR ) {
                       // probamos que se ha actualizado cargando de nuevo la lista -no es necesario-
                        $.producto.ProductoReadREST();
                    },
                    error: function(jqXHR, textStatus, errorThrown){
                        $.producto.error('Error: Producto Update','No ha sido posible actualizar el producto. Compruebe su conexión.');
                    }
                });

                // esto es para que no vaya hacia atrás (que no salga el icono volver atrás en la barra de menú) 
                $.afui.clearHistory();
                // cargamos el panel con ref r_producto.
                $.afui.loadContent("#r_producto",false,false,"up");
            }
    }
};


/**
    Función para la gestión de actualizaciones. Hay tres partes: 
    1) Listado 
    2) Formulario para modificación
    3) Envío de datos al servicio REST (PUT)
*/

$.producto.ProductoUpdateREST_cantidad = function(producto,nueva_cantidad){
   var producto1 = {
        'ref' : producto.ref,
        'nombre' : producto.nombre,
        'descripcion': producto.descripcion,
        'cantidad': nueva_cantidad
    };
    
    $.ajax({
            url: $.producto.HOST+$.producto.URL+this.TABLA+"/"+producto.ref,
            type: 'PUT',
            dataType: 'json',
            contentType: "application/json",
            data: JSON.stringify(producto1),
            success: function(result,status,jqXHR ) {
               // probamos que se ha actualizado cargando de nuevo la lista -no es necesario-
                $.producto.ProductoReadREST();
            },
            error: function(jqXHR, textStatus, errorThrown){
                $.producto.error('Error: Producto Update','No ha sido posible actualizar el producto. Compruebe su conexión.');
            }
        });
}

$.producto.ProductoSumar_cantidad = function(ref_producto,cantidadSumar){
    var disponible= $.producto.Disponible(ref_producto);
    var producto = $.producto.ObtenerDeListado(ref_producto);
    $.producto.ProductoUpdateREST_cantidad(producto,parseInt(disponible)+parseInt(cantidadSumar));
}

/**
    Función para la gestión de errores y mensajes al usuario
*/
$.producto.error = function(title, msg){
    $('#err_producto').empty();
    $('#err_producto').append('<h3>'+title+'</h3>');
    $('#err_producto').append('<p>'+msg+'</p>');
    // esto es para que no vaya hacia atrás (que no salga el icono volver atrás en la barra de menú) 
    $.afui.clearHistory();
    // cargamos el panel con ref r_producto.
    $.afui.loadContent("#err_producto",false,false,"up");
};


$.producto.Disponible= function(ref){
    var resultado = null;
    for (var i=0;i<$.listaProductos.length;i++){
        if($.listaProductos[i].ref==ref)
            resultado= $.listaProductos[i].cantidad;
    }
    return resultado;
}


$.producto.ObtenerDeListado= function(ref){
    
    for (var i=0;i<$.listaProductos.length;i++){
        if($.listaProductos[i].ref==ref){
            $.datosProducto.ref=parseInt(ref);
            $.datosProducto.nombre=$.listaProductos[i].nombre;
            $.datosProducto.descripcion=$.listaProductos[i].descripcion;
            $.datosProducto.cantidad=$.listaProductos[i].cantidad;
            return $.datosProducto;
        }
    }
}
