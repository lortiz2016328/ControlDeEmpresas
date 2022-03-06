const Usuarios = require('../models/usuarios.model');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');

function RegistrarEmpresa(req, res) {
    var parametros = req.body;
    var usuarioModel = new Usuarios();

    if (req.user.rol != 'Admin') {
        return res.status(500).send({ mensanje: "No eres admin, No puedes agregar" });
    }else {
        if (parametros.nombreE && parametros.usuario && parametros.password) {
            usuarioModel.nombreE = parametros.nombreE;
            usuarioModel.usuario = parametros.usuario;
            usuarioModel.rol = 'Empresa';
            Usuarios.find({ usuario: parametros.usuario }, (err, usuarioEcontrado) => {
                if (usuarioEcontrado.length == 0) {
                    bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada) => {
                        usuarioModel.password = passwordEncriptada;
                        usuarioModel.save((err, usuarioGuardado) => {
                            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
                            if (!usuarioGuardado) return res.status(404).send({ mensaje: "Error al guardar" });
                            return res.status(200).send({ usuario: usuarioGuardado })
                        });
                    });
                } else {
                    return res.status(500).send({ mensaje: "Este usuario ya existe" })
                }
            })
        } else {
            return res.status(500).send({ mensaje: "Rellenar todos los campos" })
        }
    }
}

function Login(req, res) {
    var parametros = req.body;

    Usuarios.findOne({ usuario: parametros.usuario }, (err, usuarioEcontrado) => {
        if (err) return res.status(500).send({ mensanje: 'Error en la peticion' });
        if (usuarioEcontrado) {
            bcrypt.compare(parametros.password, usuarioEcontrado.password, (err, verificacionPassword) => {
                if (verificacionPassword) {
                    if (parametros.obtenerToken === 'true') {
                        return res.status(500).send({ token: jwt.crearToken(usuarioEcontrado) });
                    } else {
                        usuarioEcontrado.password = undefined;
                        return res.status(200).send({ usuario: usuarioEcontrado });
                    }
                } else {
                    return res.status(500).send({ mensaje: "Contresena inválida" });
                }
            })
        }
    })
}

function EditarEmpresa(req, res) {
    var idUser = req.params.idUsuario;
    var parametros = req.body;

    if (req.user.rol == 'Empresa') {
        if (idUser !== req.user.sub) return res.status(500).send({ mensaje: "No eres admin, no puedes editar" });
        Usuarios.findByIdAndUpdate(idUser, parametros, { new: true }, (err, usuarioActualizado) => {
            if (err) return res.status(500).send({ message: "Error en la peticion" });
            if (!usuarioActualizado) return res.status(500).send({ mensanje: "Error en la busqueda" });
            return res.status(200).send({ empresa: usuarioActualizado });
        })
    } else {
        Usuarios.findByIdAndUpdate(idUser, parametros, { new: true }, (err, usuarioActualizado) => {
            if (err) return res.status(500).send({ mensanje: "Error en la peticion" });
            if (!usuarioActualizado) return res.status(500).send({ mensanje: "Error en la busqueda" });
            return res.status(200).send({ usuarios: usuarioActualizado });
        })
    }
}

function EliminarEmpresa(req, res) {
    var idUser = req.params.idUsuario;

    if (req.user.rol == 'Empresa') {
        if (idUser !== req.user.sub) return res.status(500).send({ mensaje: "No eres admin, no puedes eliminar" });
        Usuarios.findByIdAndDelete(idUser, { new: true }, (err, usuarioEliminado) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if (!usuarioEliminado) return res.status(404).send({ mensaje: "Error en la busqueda" });
            return res.status(200).send({ empresa: usuarioEliminado })
        })
    } else if (req.user.rol == 'Admin') {
        Usuarios.findByIdAndDelete(idUser, { new: true }, (err, usuarioEliminado) => {
            if (err) return res.status(500).send({ mensanje: "Error en la peticion" });
            if (!usuarioEliminado) return res.status(404).send({ mensanje: "Error en la busqueda" });
            return res.status(200).send({ usuarios: usuarioEliminado })
        })
    } else {
        return res.status(500).send({ mensanje: "Error en la petición" })
    }
}

function UsuarioInicial(){
    Usuarios.find({rol: 'Admin', usuario: 'Admin'}, (err, usuarioEcontrado) => {
        if(usuarioEcontrado.length ==0){
            bcrypt.hash('123456', null, null, (err, passwordEncriptada) => {
                Usuarios.create({
                    nombreEmpresa: null,
                    usuario: 'Admin',
                    password: passwordEncriptada,
                    rol: 'Admin'
                })
            })
        }
    })
}
module.exports = {
    RegistrarEmpresa,
    Login,
    EditarEmpresa,
    EliminarEmpresa,
    UsuarioInicial
}