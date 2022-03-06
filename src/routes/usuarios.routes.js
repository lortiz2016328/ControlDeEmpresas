const express = require('express');
const usuariosController = require('../Controllers/usuarios.controller');
const md_autenticacion = require('../middlewares/autentificacion');
var api = express.Router();

api.post('/usuarios/agregarEmpresas',md_autenticacion.Auth, usuariosController.RegistrarEmpresa);
api.put('/usuarios/editarEmpresas/:idUsuario', md_autenticacion.Auth, usuariosController.EditarEmpresa);
api.delete('/usuarios/eliminarEmpresas/:idUsuario', md_autenticacion.Auth, usuariosController.EliminarEmpresa);
api.post('/login', usuariosController.Login);

module.exports = api;