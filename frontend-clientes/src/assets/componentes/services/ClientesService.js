import axios from "axios";

const API_URL = "http://localhost:8080/clientes";

class ClientesService {
    // GET: Obtener todos los clientes
    listarclientes() {
        return axios.get(API_URL);
    }

    // POST: Crear un nuevo cliente
    crearCliente(cliente) {
        return axios.post(API_URL, cliente);
    }

    // PUT: Actualizar un cliente existente por ID
    actualizarCliente(id, cliente) {
        return axios.put(`${API_URL}/${id}`, cliente);
    }

    // DELETE: Eliminar un cliente por ID
    eliminarCliente(id) {
        return axios.delete(`${API_URL}/${id}`);
    }
}

export default new ClientesService();