const Usuario = require('../models/usuario.model');
const Producto = require('../models/productos.model');

const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');

function Registrar(req, res) {
    var parametros = req.body;
    var usuarioModel = new Usuario();

    if(parametros.nombre && parametros.apellido && 
        parametros.email && parametros.password) {
            usuarioModel.nombre = parametros.nombre;
            usuarioModel.apellido = parametros.apellido;
            usuarioModel.email = parametros.email;
            usuarioModel.rol = 'USUARIO';
            usuarioModel.imagen = null;
            usuarioModel.totalCarrito = 0;

            Usuario.find({ email : parametros.email }, (err, usuarioEncontrado) => {
                if ( usuarioEncontrado.length == 0 ) {

                    bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada) => {
                        usuarioModel.password = passwordEncriptada;

                        usuarioModel.save((err, usuarioGuardado) => {
                            if (err) return res.status(500)
                                .send({ mensaje: 'Error en la peticion' });
                            if(!usuarioGuardado) return res.status(500)
                                .send({ mensaje: 'Error al agregar el Usuario'});
                            
                            return res.status(200).send({ usuario: usuarioGuardado });
                        });
                    });                    
                } else {
                    return res.status(500)
                        .send({ mensaje: 'Este correo, ya  se encuentra utilizado' });
                }
            })
    }
}

function Login(req, res) {
    var parametros = req.body;
    Usuario.findOne({ email : parametros.email }, (err, usuarioEncontrado)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if(usuarioEncontrado){
            // COMPARO CONTRASENA SIN ENCRIPTAR CON LA ENCRIPTADA
            bcrypt.compare(parametros.password, usuarioEncontrado.password, 
                (err, verificacionPassword)=>{//TRUE OR FALSE
                    // VERIFICO SI EL PASSWORD COINCIDE EN BASE DE DATOS
                    if ( verificacionPassword ) {
                        // SI EL PARAMETRO OBTENERTOKEN ES TRUE, CREA EL TOKEN
                        if(parametros.obtenerToken === 'true'){
                            return res.status(200)
                                .send({ token: jwt.crearToken(usuarioEncontrado) })
                        } else {
                            usuarioEncontrado.password = undefined;
                            return  res.status(200)
                                .send({ usuario: usuarioEncontrado })
                        }

                        
                    } else {
                        return res.status(500)
                            .send({ mensaje: 'Las contrasena no coincide'});
                    }
                })

        } else {
            return res.status(500)
                .send({ mensaje: 'Error, el correo no se encuentra registrado.'})
        }
    })
}

function EditarUsuario(req, res) {
    var idUser = req.params.idUsuario;
    var parametros = req.body;    

    if ( idUser !== req.user.sub ) return res.status(500)
        .send({ mensaje: 'No puede editar otros usuarios'});

    Usuario.findByIdAndUpdate(req.user.sub, parametros, {new : true},
        (err, usuarioActualizado)=>{
            if(err) return res.status(500)
                .send({ mensaje: 'Error en la peticion' });
            if(!usuarioActualizado) return res.status(500)
                .send({ mensaje: 'Error al editar el Usuario'});
            
            return res.status(200).send({usuario : usuarioActualizado})
        })
}

function agregarProductoCarrito(req, res) {
    const usuarioLogeado = req.user.sub;
    const parametros = req.body;

    Producto.findOne({ nombre: parametros.nombreProducto }, (err, productoEncontrado)=>{
        if(err) return res.status(500).send({ mensaje: "Error en la peticion"});
        if(!productoEncontrado) return res.status(404).send({ mensaje: 'Error al obtener el Producto'});

        Usuario.findByIdAndUpdate(usuarioLogeado, { $push: { carrito: { nombreProducto: parametros.nombreProducto,
            cantidadComprada: parametros.cantidad, precioUnitario: productoEncontrado.precio } } }, { new: true}, 
            (err, usuarioActualizado)=>{
                if(err) return res.status(500).send({ mensaje: "Error en la peticion de Usuario"});
                if(!usuarioActualizado) return res.status(500).send({ mensaje: 'Error al agregar el producto al carrito'});

                let totalCarritoLocal = 0;

                for(let i = 0; i < usuarioActualizado.carrito.length; i++){
                    // totalCarritoLocal = totalCarritoLocal + usuarioActualizado.carrito[i].precioUnitario;
                    totalCarritoLocal += usuarioActualizado.carrito[i].precioUnitario;
                }

                Usuario.findByIdAndUpdate(usuarioLogeado, { totalCarrito: totalCarritoLocal }, {new: true},
                    (err, totalActualizado)=> {
                        if(err) return res.status(500).send({ mensaje: "Error en la peticion de Total Carrito"});
                        if(!totalActualizado) return res.status(500).send({ mensaje: 'Error al modificar el total del carrito'});

                        return res.status(200).send({ usuario: totalActualizado })
                    })
            })
    })


    
}

function carritoAfactura(req, res){

    // const facturaModel = new Factura();

    /* Usuario.findById(req.user.sub, (err, usuarioEncontrado)=>{
        
        facturaModel.listaProductos = usuarioEncontrado.carrito;
        facturaModel.idUsuario = req.user.sub;
        facturaModel.totalFactura = usuarioEncontrado.totalCarrito;

        for (let i = 0; i < usuarioEncontrado.carrito.length; i++) {
            Producto.findByOneAndUpdate({nombre: usuarioEncontrado.carrito[i].nombreProducto} , 
                {  $inc : { cantidad: usuarioEncontrado.carrito[i].cantidadComprada * -1, 
                    vendido: usuarioEncontrado.carrito[i].cantidadComprada }})
        }
    }) */

    Usuario.findByIdAndUpdate(req.user.sub, { $set: { carrito: [] }, totalCarrito: 0 }, { new: true }, 
        (err, carritoVacio)=>{
            return res.status(200).send({ usuario: carritoVacio })
        })

}

module.exports = {
    Registrar,
    Login,
    EditarUsuario,
    agregarProductoCarrito,
    carritoAfactura
}