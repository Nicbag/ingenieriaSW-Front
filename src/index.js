import React from "react";
import ReactDOM from "react-dom";
import CRUDTable, {
  Fields,
  Field,
  CreateForm,
  UpdateForm,
  DeleteForm
} from "react-crud-table";

// Component's Base CSS
import "./index.css";

// eslint-disable-next-line
let tasks = [
  {
    id: 1,
    codigo: "7812-E",
    ciudadDestino: "Mendoza",
    ciudadOrigen: "Mendoza",
    courier: "Andreani",
    costoEnvio: "850",
  }
];

const SORTERS = {
  NUMBER_ASCENDING: mapper => (a, b) => mapper(a) - mapper(b),
  NUMBER_DESCENDING: mapper => (a, b) => mapper(b) - mapper(a),
  STRING_ASCENDING: mapper => (a, b) => mapper(a).localeCompare(mapper(b)),
  STRING_DESCENDING: mapper => (a, b) => mapper(b).localeCompare(mapper(a))
};

const getSorter = data => {
  const mapper = x => x[data.field];
  let sorter = SORTERS.STRING_ASCENDING(mapper);

  if (data.field === "id") {
    sorter =
      data.direction === "ascending"
        ? SORTERS.NUMBER_ASCENDING(mapper)
        : SORTERS.NUMBER_DESCENDING(mapper);
  } else {
    sorter =
      data.direction === "ascending"
        ? SORTERS.STRING_ASCENDING(mapper)
        : SORTERS.STRING_DESCENDING(mapper);
  }

  return sorter;
};

let count = tasks.length;
const service = {
  fetchItems: payload => {
    let result = Array.from(tasks);
    result = result.sort(getSorter(payload.sort));
    return Promise.resolve(result);
  },
  create: task => {

    console.log(task)
    console.log(JSON.stringify(task))

    const requestOptions = {
      method: 'POST',
      mode: "no-cors",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    };

    const URL = "https://ingsoftware-production.up.railway.app/api/envio/create"

    // Send a POST request using fetch
    return fetch(URL, requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        count += 1;
        tasks.push({
          ...response,
          id: count
        });
        return Promise.resolve(task);
      })
      .catch(error => {
        console.error('Error para crear el envío:', error);
        return Promise.reject(error);
      });
    },
  update: data => {
    const task = tasks.find(t => t.id === data.id);
    task.title = data.title;
    task.description = data.description;
    return Promise.resolve(task);
  },
  delete: data => {
    const task = tasks.find(t => t.id === data.id);
    tasks = tasks.filter(t => t.id !== task.id);
    return Promise.resolve(task);
  }
};

const styles = {
  container: { margin: "auto", width: "fit-content" }
};

const Example = () => (
  <div style={styles.container}>
    <CRUDTable
      caption="ENVIOS"
      fetchItems={payload => service.fetchItems(payload)}
    >
      <Fields>
        <Field name="id" label="Id" hideInCreateForm />
        <Field name="codigo" label="Codigo" placeholder="Codigo" />
        <Field name="ciudadDestino" label="Ciudad de Destino" placeholder="Ciudad de Origen"/>
        <Field name="ciudadOrigen" label="Ciudad de Origen" placeholder="Ciudad de Origen"/>
        <Field name="courier" label="Courier" placeholder="courier" />
        <Field name="costoEnvio" label="Costo de Envio" placeholder="Costo de envio"/>
        <Field name="observacionesEnvio" label="Observaciones" placeholder="Observaciones"/>
      </Fields>
      <CreateForm
        title="Nuevo Envío"
        trigger="Crear envío"
        onSubmit={task => service.create(task)}
        submitText="Crear"
        validate={values => {
          const errors = {};
          if (!values.codigo) {
            errors.codigo = "Porfavor ingresa un código";
          }

          return errors;
        }}
      />

      <UpdateForm
        title="Actualizar envío"
        trigger="Actualizar"
        onSubmit={task => service.update(task)}
        submitText="Actualizar"
        validate={values => {
          const errors = {};

          if (!values.id) {
            errors.id = "Es necesario un id";
          }

          return errors;
        }}
      />

      <DeleteForm
        title="Borrar Envío"
        message="¿Estas seguro de que quieres borrar este envío?"
        trigger="Delete"
        onSubmit={task => service.delete(task)}
        submitText="Borrar"
        validate={values => {
          const errors = {};
          if (!values.id) {
            errors.id = "El id es necesario";
          }
          return errors;
        }}
      />
    </CRUDTable>
  </div>
);

Example.propTypes = {};

ReactDOM.render(<Example />, document.getElementById("root"));
