import {
    Meteor
} from 'meteor/meteor';
import {
    Mongo
} from 'meteor/mongo';
import {
    Pacientes
} from './pacientes.js';
import {
    Doctores
} from './doctores';
import {
    Nutricionistas
} from './nutricionistas';

const jwt = require('jsonwebtoken');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('1B5CF523A08CE35BAC7331D955F69723734C7BDF5C2A7A76570FAF5F3E0460C9');

export const Usuarios = new Mongo.Collection('usuarios');

Meteor.methods({
    'usuarios.insertar'({
        nombre,
        identificacion,
        correo,
        celular,
        clave,
        rol
    }) {

        let usuario = {
            nombre: nombre,
            identificacion: identificacion,
            correo: correo,
            celular: celular,
            clave: cryptr.encrypt(clave),
            rol: rol,
            fechaRegistro: moment().format('ddd MMM D YYYY')
        };

        try {

            if (rol === 'paciente') {

                usuario.doctor = "";
                usuario.nutricionista = "";
                usuario.alimentosConsumidos = [];
                usuario.examenesMedicos = [];
                usuario.medicamentosAsignados = [];

                Pacientes.insert(
                    usuario
                );
            } else if (rol === 'doctor') {
                usuario.pacientes = [];

                Doctores.insert(
                    usuario
                );
            } else if (rol === 'nutricionista') {
                usuario.nutricionistas = [];

                Nutricionistas.insert(
                    usuario
                );
            }

            return true;
        } catch (err) {
            if (err) {
                if (err.code === 11000) {
                    throw new Meteor.Error("Ya existe un usuario con ese número de identificación o correo asociado.");
                } else {
                    throw new Meteor.Error("Se presentó un error al crear el usuario. Por favor intenta nuevamente");
                }
            }
        }

    },
    'usuarios.decodificar'(token) {
        let usuario = decodificarToken(token);
        if (usuario) {

            let nUsuario = null;

            if (usuario.rol === 'paciente') {
                nUsuario = Pacientes.findOne({
                    _id: usuario._id
                });
            } else if (usuario.rol === 'doctor') {
                nUsuario = Doctores.findOne({
                    _id: usuario._id
                });
            } else if (usuario.rol === 'nutricionista') {
                nUsuario = Nutricionistas.findOne({
                    _id: usuario._id
                });
            }


            if (nUsuario) {
                delete nUsuario.alimentosConsumidos
                delete nUsuario.clave;
                return nUsuario;
            } else {
                return null
            }
        } else {
            return null;
        }
    },
    'usuarios.asignarNutricionista'({
        identificacionPaciente,
        identificacionNutricionista
    }) {
        check(identificacionPaciente, String);
        check(identificacionNutricionista, String);

        verificarPermisos(usuario.rol);

        const paciente = Pacientes.findOne({
            identificacion: identificacionPaciente,
        });

        verificarExistenciaPaciente(paciente);

        const nutricionista = Nutricionistas.findOne({
            identificacion: identificacionNutricionista,
        });

        verificarExistenciaNutricionista(nutricionista);


        try {
            Pacientes.update({
                identificacion: identificacionPaciente
            }, {
                $set: {
                    nutricionista: identificacionNutricionista
                }
            });

            return "El paciente " + paciente.nombre + " fue asignado al nutricionista " + nutricionista.nombre + " correctamente";
        } catch (error) {
            throw new Meteor.Error(error);
        }
    }
});

function decodificarToken(token) {
    return token ? jwt.verify(token, process.env.CODE_TOKEN) : null;
}

function verificarPermisos(rol) {
    if (rol === "paciente") {
        throw new Meteor.Error('No se encuentra autorizado para realizar esta acción');
    }
}

function verificarExistenciaPaciente(paciente) {
    if (!paciente) {
        throw new Meteor.Error('No se encuentra el paciente.');
    }
}

function verificarExistenciaNutricionista(nutricionista) {
    if (!nutricionista) {
        throw new Meteor.Error('No se encuentra el nutricionista.');
    }
}