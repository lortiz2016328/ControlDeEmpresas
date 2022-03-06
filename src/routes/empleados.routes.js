const express = require('express');
const empleadosController = require('../Controllers/empleados.controller');
const md_autenticacion = require('../middlewares/autentificacion'); 

var api = express.Router();

api.post('/empleados/crearEmpleados', md_autenticacion.Auth, empleadosController.crearEmpleados);
api.put('/empleados/editarEmpleados/:idEmpleado', md_autenticacion.Auth, empleadosController.editarEmpleados);
api.delete('/empleados/eliminarEmpleados/:idEmpleado', md_autenticacion.Auth, empleadosController.eliminarEmpleados);
api.get('/empleados/conteoEmpleados', md_autenticacion.Auth, empleadosController.conteoEmpleados);
api.get('/empleados/buscarId/:idBusqueda', md_autenticacion.Auth, empleadosController.buscarId);
api.get('/empleados/buscarNombre/:idBusqueda', md_autenticacion.Auth, empleadosController.buscarNombre);
api.get('/empleados/buscarPuesto/:idBusqueda', md_autenticacion.Auth, empleadosController.buscarPuesto);
api.get('/empleados/buscarDepartamento/:idBusqueda', md_autenticacion.Auth, empleadosController.buscarDepartamento);
api.get('/empleados', md_autenticacion.Auth, empleadosController.todosLosEmpleados);
api.get('/empleados/generarPDF', md_autenticacion.Auth, empleadosController.generarPdf);


module.exports = api;