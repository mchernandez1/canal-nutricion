import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import InfoPaciente from '../paciente/InfoPaciente.jsx';
import { withTracker } from 'meteor/react-meteor-data';
import { Pacientes } from '../../api/pacientes.js';
import { withRouter } from 'react-router';

class DashboardDoctor extends Component {
  constructor(props) {
    super(props);

    if (!localStorage.getItem('foohealliStuff')) {
      this.props.history.push('/');
    }

    this.state = {
      token: localStorage.getItem('foohealliStuff'),
      doctor: false,
      usuario: null
    };
  }

  componentDidMount() {
    Meteor.call('usuarios.decodificar', this.state.token, (err, res) => {
      if (err) {
        alert(err.error);
      } else if (res) {
        if (res.rol === 'doctor') {
          this.setState({
            doctor: true,
            usuario: res
          });
        } else {
          this.props.history.push('/');
        }
      }
    });
  }

  renderPacientes() {
    let pacientes = this.props.pacientes;
    return pacientes.map(paciente => (
      <InfoPaciente
        key={paciente._id}
        paciente={paciente}
        nombre={paciente.nombre}
        identificacion={paciente.identificacion}
        correo={paciente.correo}
        celular={paciente.celular}
        nutricionista={false}
      />
    ));
  }

  render() {
    return (
      <div id="pacientes-nutricionista" className="row">
        <br />
        <div className="col-12">
          <br />
          <div className="bg-foohealli text-light">
            <br />
            <h3 className="text-center font-weight-bold">
              &nbsp;Tus Pacientes&nbsp;
            </h3>
            <br />
          </div>
          <hr />
        </div>
        <div className="col-12">
          <ul className="list-group">{this.renderPacientes()}</ul>
        </div>
      </div>
    );
  }
}

DashboardDoctor = withRouter(DashboardDoctor);

export default withTracker(() => {
  Meteor.subscribe('pacientes', localStorage.getItem('foohealliStuff'));
  return {
    pacientes: Pacientes.find({}).fetch()
  };
})(DashboardDoctor);
