const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UsuariosSchema = Schema({ 
    nombreE: String,
    usuario: String,
    password: String,
    rol: String,
    conteo: Number
});

module.exports = mongoose.model('Usuarios',UsuariosSchema);