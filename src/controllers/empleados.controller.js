const Empleados = require('../models/empleados.model');
const Usuarios = require('../models/usuarios.model');


function crearEmpleados(req, res) {
    var parametros = req.body;
    var empleadosModel = new Empleados();

    if (parametros.nombre && parametros.apellido && parametros.departamento && parametros.puesto) {
        empleadosModel.nombre = parametros.nombre;
        empleadosModel.apellido = parametros.apellido;
        if (req.user.rol == 'Admin') {
            empleadosModel.idEmpresa = parametros.idEmpresa;
        } else if (req.user.rol != 'Admin') {
            empleadosModel.idEmpresa = req.user.sub;
        }
        empleadosModel.departamento = parametros.departamento;
        empleadosModel.puesto = parametros.puesto;

        if (req.user.rol == 'Admin') {
            return res.status(500).send({ mensaje: "No eres parte de la empresa" });
        } else {
            empleadosModel.save((err, empleadoGuardado) => {
                if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
                if (!empleadoGuardado) return res.status(500).send({ mensaje: "Error al guardar" });

                Empleados.find({ idEmpresa: req.user.sub }, (err, cantidadEmpleados) => {
                    if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
                    if (!cantidadEmpleados) return res.status(500).send({ mensaje: "Error en la busqueda" })

                    Usuarios.findByIdAndUpdate({ _id: req.user.sub }, { conteo: cantidadEmpleados.length }, (err, actualizarEmpleados) => {
                        if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
                        if (!actualizarEmpleados) return res.status(500).send({ mensaje: "Error al actualizar" })

                    })
                })
                return res.status(200).send({ empleado: empleadoGuardado });
            });
        }
    } else {
        return res.status(500).send({ mensaje: "Rellenar todos los campos" });
    }
}

function editarEmpleados(req, res) {
    var idEmp = req.params.idEmpleado;
    var parametros = req.body;
    if (req.user.rol == 'Admin') {
        Empleados.findOneAndUpdate({ _id: idEmp }, parametros, { new: true }, (err, empleadoEditado) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if (!empleadoEditado) return res.status(500).send({ mensaje: "No eres parte de la empresa" });

            return res.status(200).send({ empleado: empleadoEditado });
        });
    } else if (req.user.rol != 'Admin') {
        Empleados.findOneAndUpdate({ _id: idEmp, idEmpresa: req.user.sub }, parametros, { new: true }, (err, empleadoEditado) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if (!empleadoEditado) return res.status(500).send({ mensaje: "Error en la eliminación" });

            return res.status(200).send({ empleado: empleadoEditado });
        });
    }
}

function eliminarEmpleados(req, res) {
    var idEmp = req.params.idEmpleado;

    if (req.user.rol == 'Admin') {
        Empleados.findOneAndDelete({ _id: idEmp }, { new: true }, (err, empleadoEliminado) => {
            if (err) return res.status(500).send({ mensaje: "Erroe en la petición" });
            if (!empleadoEliminado) return res.status(404).send({ message: "No eres parte de la empresa" });

            Empleados.find({ idEmpresa: req.user.sub }, (err, cantidadEmpleados) => {
                if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
                if (!cantidadEmpleados) return res.status(500).send({ mensaje: "Error en la busqueda" })

                Usuarios.findByIdAndUpdate({ _id: req.user.sub }, { conteo: cantidadEmpleados.length }, (err, actualizarEmpleados) => {
                    if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
                    if (!actualizarEmpleados) return res.status(500).send({ mensaje: "Error en la Actualizacion" })
                })
            })
            return res.status(200).send({ empleado: empleadoEliminado });
        })
    } else if (req.user.rol != 'Admin') {
        Empleados.findOneAndDelete({ _id: idEmp, idEmpresa: req.user.sub }, { new: true }, (err, empleadoEliminado) => {
            if (err) return res.status(500).send({ message: "Error en la peticion" });
            if (!empleadoEliminado) return res.status(500).send({ message: "No eres parte de la empresa" });

            Empleados.find({ idEmpresa: req.user.sub }, (err, cantidadEmpleados) => {
                if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
                if (!cantidadEmpleados) return res.status(500).send({ mensaje: "Error en la busqueda" });

                Usuarios.findByIdAndUpdate({ _id: req.user.sub }, { conteo: cantidadEmpleados.length }, (err, actualizarEmpleados) => {
                    if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
                    if (!actualizarEmpleados) return res.status(500).send({ mensaje: "Error en la Actualizacion" })
                })
            })
            return res.status(200).send({ empleado: empleadoEliminado });
        })
    }
}

function conteoEmpleados(req, res) {
    var parametros = req.body;

    if (req.user.rol == 'Admin') {
        Empleados.find({ idEmpresa: parametros.idEmpresa }, (err, cantidadEmpleados) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
            if (!cantidadEmpleados) return res.status(500).send({ mensaje: "Error en la busqueda" })

            return res.status(200).send({ conteoEmpleado: cantidadEmpleados.length })
        })

    } else {
        Empleados.find({ idEmpresa: req.user.sub }, (err, cantidadEmpleados) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" })
            if (!cantidadEmpleados) return res.status(500).send({ mensaje: "Error en la busqueda" });

            return res.status(200).send({ conteoEmpleado: cantidadEmpleados.length })
        })
    }
}

function buscarId(req, res) {
    var idBus = req.params.idBuscar;
    var parametros = req.body;

    if (req.user.rol == 'Admin') {
        Empleados.findOne({ _id: idBus, idEmpresa: parametros.idEmpresa }, (err, usuarioEncontrado) => {
            if (err) return res.status(500).send({ mensaje: "Erro en la peticion" });
            if (!usuarioEncontrado) return res.status(500).send({ mensaje: "Las credenciales no son iguales" });

            return res.status(200).send({ usuarios: usuarioEncontrado });
        }).populate('idEmpresa', 'nombreE');

    } else {
        Empleados.findOne({ _id: iBbus, idEmpresa: req.user.sub }, (err, usuarioEncontrado) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if (!usuarioEncontrado) return res.status(500).send({ mensaje: "Las credenciales no son iguales" });

            return res.status(200).send({ usuarios: usuarioEncontrado });
        }).populate('idEmpresa', 'nombreE');
    }
}

function buscarNombre(req, res) {
    var idBus = req.params.dBusqueda;
    var parametros = req.body;

    if (req.user.rol == 'Admin') {
        Empleados.find({ nombre: { $regex: idBus, $options: 'i' }, idEmpresa: parametros.idEmpresa }, (err, usuarioEncontrado) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if (!usuarioEncontrado) return res.status(500).send({ mensaje: "Erroen la busqueda" });

            return res.status(200).send({ usuarios: usuarioEncontrado });
        }).populate('idEmpresa', 'nombreE')

    } else {
        Empleados.find({ nombre: { $regex: idBus, $options: 'i' }, idEmpresa: req.user.sub }, (err, usuarioEncontrado) => {
            if (err) return res.status(500).send({ mensaje: "Erroe en la petición" });
            if (!usuarioEncontrado) return res.status(500).send({ mensaje: "Error en la busqyueda" });

            return res.status(200).send({ usuarios: usuarioEncontrado });
        }).populate('idEmpresa', 'nombreE')
    }

}

function buscarPuesto(req, res) {
    var idBus = req.params.idBusqueda;
    var parametros = req.body;

    if (req.user.rol == 'Admin') {
        Empleados.find({ puesto: { $regex: idBus, $options: 'i' }, idEmpresa: parametros.idEmpresa }, (err, usuarioEncontrado) => {
            if (err) return res.status(500).send({ mesaje: "Error en la pericion" });
            if (!usuarioEncontrado) return res.status(404).send({ MENSAJE: "Error en la busqueda" })

            return res.status(200).send({ usuarios: usuarioEncontrado });
        }).populate('idEmpresa', 'nombreE');
    } else {
        Empleados.find({ puesto: { $regex: idBus, $options: 'i' }, idEmpresa: req.user.sub }, (err, usuarioEncontrado) => {
            if (err) return res.status(500).send({ message: "Error en la peticion" });
            if (!usuarioEncontrado) return res.status(500).send({ mensaje: "Error en la busqueda" })

            return res.status(200).send({ usuarios: usuarioEncontrado })
        }).populate('idEmpresa', 'nombreE');
    }
}

function buscarDepartamento(req, res) {
    var idBus = req.params.idBusqueda;
    var parametros = req.body;

    if (req.user.rol == 'Admin') {
        Empleados.find({ departamento: { $regex: idBus, $options: 'i' }, idEmpresa: parametros.idEmpresa }, (err, usuarioEncontrado) => {
            if (err) return res.status(500).send({ message: "Error en la peticion" });
            if (!usuarioEncontrado) return res.status(500).send({ mensaje: "Error en la busqueda" })

            return res.status(200).send({ usuarios: usuarioEncontrado });
        }).populate('idEmpresa', 'nombreE');

    } else {
        Empleados.find({ departamento: { $regex: idBus, $options: 'i' }, idEmpresa: req.user.sub }, (err, usuarioEncontrado) => {
            if (err) return res.status(500).send({ message: "Error en la peticion" });
            if (!usuarioEncontrado) return res.status(500).send({ mensaje: "Error en la busqueda" });

            return res.status(200).send({ usuarios: usuarioEncontrado });
        }).populate('idEmpresa', 'nombreE')
    }
}

function todosLosEmpleados(req, res) {
    var parametros = req.body;

    if (req.user.rol == 'Admin') {
        Empleados.find({ idEmpresa: parametros.idEmpresa }, (err, empleadoEncontrado) => {
            if (err) return res.status(500).send({ mensaje: "Error en la pericion" });
            if (!empleadoEncontrado) return res.status(500).send({ mensaje: "Error en la busqueda" })

            return res.status(200).send({ empleado: empleadoEncontrado });
        }).populate('idEmpresa', 'nombree');

    } else {
        Empleados.find({ idEmpresa: req.user.sub }, (err, empleadoEncontrado) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if (!empleadoEncontrado) return res.status(500).send({ mensaje: "Error en la busqueda" });

            return res.status(200).send({ empleado: empleadoEncontrado })
        }).populate('idEmpresa', 'nombreE')
    }
}


function generarPdf(req, res) {
    var usuario = req.user.sub
    Empleados.find({ idEmpresa: usuario }, (err, empleadoPdf) => {
        if (err) return res.status(500).send({ mensaje: "Error al encontrar el empleado" });
        const fs = require('fs');
        const Pdfmake = require('pdfmake');
        var fonts = {
            Roboto: {
                normal: './fonts/roboto/Roboto-Regular.ttf',
                bold: './fonts/roboto/Roboto-Medium.ttf',
                italics: './fonts/roboto/Roboto-Italic.ttf',
                bolditalics: './fonts/roboto/Roboto-MediumItalic.ttf'
            }
        };
        let pdf = new Pdfmake(fonts);
        let content = [{
            text: "Empleados",
            fontSize: 48,
            alignment: 'center',
            color: '#000000',
            bold: true,
            margin: [2, 2, 2, 18]
        }]

        for (let i = 0; i < empleadoPdf.length; i++) {
            let array = i + 1;
            
            content.push({
                text: ' ',
            })

            content.push({
                text: [array + ')Empleado:'] + ' ' + empleadoPdf[i].nombre,
                fontSize: 16
            })
            content.push({
                text: 'Puesto :' + ' ' + empleadoPdf[i].puesto,
                fontSize: 16
            })
            content.push({
                text: 'Departamento :' + ' ' + empleadoPdf[i].departamento,
                fontSize: 16
            })
            content.push({
                text: 'Empresa :',
                alignment: 'center',
                fontSize: 16, fontFamily: 'Roboto',
                fontWeight: 'bold'
            })

            content.push({
                text: empleadoPdf[i].idEmpresa.nombre,
                alignment: 'center',
                fontSize: 16, fontFamily: 'Roboto',
                fontWeight: 'bold'
            })

        }
        content.push({
            text: ' ',
        })
        content.push({
            text: 'Conteo de Empleados:' + ' ' + empleadoPdf.length,
            alignment: 'end',
            color: '#04098a',
            fontSize: 16,
        })


        let docDefinition = {
            contect: content,
            pageSize: {
                width: 595.28,
                height: 841.89
            },
            background: function () {
                return {
                    canvas: [
                        {
                            type: 'rect',
                            x: 0,
                            y: 0,
                            w: 520,
                            h: 150,
                            color: '#ffffff'
                        },
                        {
                            type: 'rect',
                            x: 0,
                            y: 30,
                            w: 520,
                            h: 75,
                            color: '#ffffff'
                        }
                    ]

                }
            }
        }

        let pdfDoc = pdf.createPdfKitDocument(docDefinition, {});
        pdfDoc.pipe(fs.createWriteStream("pdfs/pdfempleados.pdf"));
        pdfDoc.end();
    })

}


module.exports = {
    crearEmpleados,
    editarEmpleados,
    eliminarEmpleados,
    conteoEmpleados,
    buscarId,
    buscarNombre,
    buscarPuesto,
    buscarDepartamento,
    todosLosEmpleados,
    generarPdf,
}