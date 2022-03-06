const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EmpleadosSchema = Schema({ 
    nombre: String,
    apellido: String,
    departamento: String,
    puesto: String,
    idEmpresa: {type: Schema.Types.ObjectId, ref: 'Usuarios'}
});

module.exports = mongoose.model('Empleados', EmpleadosSchema);