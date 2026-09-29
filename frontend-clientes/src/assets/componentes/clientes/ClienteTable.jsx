import { useEffect, useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Menu } from "primereact/menu";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import ClienteService from "../services/ClientesService";

function ClienteTable() {
    const [clientes, setClientes] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const menuRef = useRef(null);
    const toastRef = useRef(null);

    // Estados para modales
    const [mostrarModalCrear, setMostrarModalCrear] = useState(false);
    const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
    const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);

    // Estados de formulario
    const [formCrear, setFormCrear] = useState({ nombre: "", apellido: "", email: "", contrasena: "" });
    const [formEditar, setFormEditar] = useState({ idCliente: "", nombre: "", apellido: "", email: "", contrasena: "" });

    // Cargar lista de clientes
    const cargarClientes = () => {
        ClienteService.listarclientes()
            .then((response) => {
                const datosBrutos = Array.isArray(response.data) ? response.data : [];
                const datosSeparados = datosBrutos.map((cliente) => {
                    const nombreCompleto = cliente.nombre || cliente.nombres || "";
                    const partes = nombreCompleto.trim().split(/\s+/);
                    return {
                        ...cliente,
                        soloNombre: partes[0] || "",
                        soloApellido: partes.slice(1).join(" ") || ""
                    };
                });
                setClientes(datosSeparados);
            })
            .catch((error) => {
                console.error("Error al obtener los clientes:", error);
                setClientes([]);
            });
    };

    useEffect(() => {
        cargarClientes();
    }, []);

    // -------------------------------------------------------------
    // ACCIONES CRUD (LÓGICA INTACTA)
    // -------------------------------------------------------------

    const guardarNuevoCliente = () => {
        if (!formCrear.nombre.trim() || !formCrear.email.trim() || !formCrear.contrasena.trim()) {
            toastRef.current.show({ 
                severity: "warn", 
                summary: "Campos requeridos", 
                detail: "Por favor complete nombre, correo y contraseña." 
            });
            return;
        }

        const payload = {
            nombre: `${formCrear.nombre.trim()} ${formCrear.apellido.trim()}`.trim(),
            email: formCrear.email.trim(),
            contrasena: formCrear.contrasena.trim()
        };

        ClienteService.crearCliente(payload)
            .then(() => {
                toastRef.current.show({ severity: "success", summary: "Éxito", detail: "Cliente registrado correctamente." });
                setMostrarModalCrear(false);
                setFormCrear({ nombre: "", apellido: "", email: "", contrasena: "" });
                cargarClientes();
            })
            .catch((error) => {
                console.error(error);
                toastRef.current.show({ severity: "error", summary: "Error", detail: "No se pudo guardar el cliente en la BD." });
            });
    };

    const abrirModalEditar = (cliente) => {
        setFormEditar({
            idCliente: cliente.idCliente,
            nombre: cliente.soloNombre || "",
            apellido: cliente.soloApellido || "",
            email: cliente.email || "",
            contrasena: cliente.contrasena || ""
        });
        setMostrarModalEditar(true);
    };

    const guardarActualizacion = () => {
        if (!formEditar.nombre.trim() || !formEditar.email.trim() || !formEditar.contrasena.trim()) {
            toastRef.current.show({ 
                severity: "warn", 
                summary: "Campos requeridos", 
                detail: "Por favor complete nombre, correo y contraseña." 
            });
            return;
        }

        const payload = {
            idCliente: formEditar.idCliente,
            nombre: `${formEditar.nombre.trim()} ${formEditar.apellido.trim()}`.trim(),
            email: formEditar.email.trim(),
            contrasena: formEditar.contrasena.trim()
        };

        ClienteService.actualizarCliente(formEditar.idCliente, payload)
            .then(() => {
                toastRef.current.show({ severity: "success", summary: "Actualizado", detail: "Datos actualizados en la BD." });
                setMostrarModalEditar(false);
                cargarClientes();
            })
            .catch((error) => {
                console.error(error);
                toastRef.current.show({ severity: "error", summary: "Error", detail: "No se pudo actualizar el cliente." });
            });
    };

    const confirmarEliminacion = () => {
        if (!clienteSeleccionado) return;

        ClienteService.eliminarCliente(clienteSeleccionado.idCliente)
            .then(() => {
                toastRef.current.show({ severity: "success", summary: "Eliminado", detail: "Cliente eliminado de la BD." });
                setMostrarModalEliminar(false);
                cargarClientes();
            })
            .catch((error) => {
                console.error(error);
                toastRef.current.show({ severity: "error", summary: "Error", detail: "No se pudo eliminar el cliente." });
            });
    };

    // -------------------------------------------------------------
    // MENÚ Y ENCABEZADO CON BRANDING CINEVO
    // -------------------------------------------------------------

    const itemsMenu = [
        {
            label: "Actualizar datos",
            icon: "pi pi-user-edit",
            command: () => abrirModalEditar(clienteSeleccionado)
        },
        { separator: true },
        {
            label: "Eliminar",
            icon: "pi pi-trash",
            className: "p-button-danger",
            command: () => setMostrarModalEliminar(true)
        }
    ];

    const headerTabla = (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "6px 0" }}>
            {/* Esquina superior izquierda: Logo Cinevo + Texto + Ícono */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{
                    backgroundColor: "rgba(99, 102, 241, 0.12)",
                    border: "1px solid rgba(99, 102, 241, 0.3)",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                }}>
                    <i className="pi pi-users" style={{ color: "#818cf8", fontSize: "1.2rem" }} />
                    <i className="pi pi-id-card" style={{ color: "#a5b4fc", fontSize: "1rem" }} />
                </div>
                
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                    <span style={{ fontSize: "1.75rem", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.03em" }}>
                        Cine<span style={{ color: "#6366f1" }}>vo</span>
                    </span>
                    <span style={{ color: "#475569", fontSize: "1.2rem", fontWeight: "300" }}>|</span>
                    <span style={{ fontSize: "1rem", fontWeight: "500", color: "#cbd5e1", letterSpacing: "-0.01em" }}>
                        Sistema de Gestión de clientes
                    </span>
                </div>
            </div>

            {/* Parte Derecha: Buscador y Botón Crear */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ position: "relative" }}>
                    <i className="pi pi-search" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                    <InputText
                        type="search"
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Buscar por ID..."
                        className="cinevo-input-search"
                        style={{ paddingLeft: "36px", width: "210px", borderRadius: "8px", backgroundColor: "#07080e", borderColor: "#1e2235", color: "#f8fafc" }}
                    />
                </div>
                <Button
                    icon="pi pi-plus"
                    rounded
                    aria-label="Agregar cliente"
                    onClick={() => {
                        setFormCrear({ nombre: "", apellido: "", email: "", contrasena: "" });
                        setMostrarModalCrear(true);
                    }}
                    style={{ backgroundColor: "#4f46e5", borderColor: "#4f46e5", color: "#ffffff", boxShadow: "0 4px 14px rgba(79, 70, 229, 0.4)" }}
                />
            </div>
        </div>
    );

    const actionBodyTemplate = (rowData) => {
        return (
            <div style={{ textAlign: "right" }}>
                <Button
                    icon="pi pi-pencil"
                    rounded
                    text
                    className="hover-action-btn"
                    style={{ color: "#a5b4fc" }}
                    onClick={(e) => {
                        setClienteSeleccionado(rowData);
                        menuRef.current.toggle(e);
                    }}
                />
            </div>
        );
    };

    return (
        <div className="card cinevo-theme-container">
            <Toast ref={toastRef} />

            {/* ESTILOS CSS CON EL FONDO OSCURO EXACTO DE CINEVO */}
            <style>{`
                /* Fondo General de la Aplicación y Contenedores */
                body, html {
                    background-color: #07080e !important;
                }

                .cinevo-theme-container {
                    background-color: #07080e !important;
                    border: 1px solid #1a1d2e;
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
                    color: #f8fafc;
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                }

                /* Header y Tabla */
                .p-datatable-header {
                    background-color: #07080e !important;
                    border: none !important;
                    padding: 0 0 20px 0 !important;
                }
                .p-datatable {
                    background-color: #07080e !important;
                }
                .p-datatable .p-datatable-thead > tr > th {
                    background-color: #0d0e17 !important;
                    color: #94a3b8 !important;
                    border-bottom: 1px solid #1e2235 !important;
                    border-top: 1px solid #1e2235 !important;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .p-datatable .p-datatable-tbody > tr {
                    background-color: #07080e !important;
                    color: #f8fafc !important;
                    border-bottom: 1px solid #141724 !important;
                    transition: background-color 0.2s ease;
                }
                .p-datatable .p-datatable-tbody > tr:hover {
                    background-color: #0f111d !important;
                }
                
                /* Hover en botón del lápiz */
                .p-datatable-tbody > tr .hover-action-btn {
                    opacity: 0;
                    transition: opacity 0.2s ease-in-out;
                }
                .p-datatable-tbody > tr:hover .hover-action-btn {
                    opacity: 1;
                }

                /* Paginador */
                .p-paginator {
                    background-color: #07080e !important;
                    border: none !important;
                    padding-top: 20px !important;
                }
                .p-paginator .p-paginator-page, 
                .p-paginator .p-paginator-first, 
                .p-paginator .p-paginator-prev, 
                .p-paginator .p-paginator-next, 
                .p-paginator .p-paginator-last {
                    color: #94a3b8 !important;
                    border-radius: 8px !important;
                    background-color: #0d0e17 !important;
                    border: 1px solid #1e2235 !important;
                    margin: 0 2px !important;
                }
                .p-paginator .p-paginator-page.p-highlight {
                    background-color: #4f46e5 !important;
                    border-color: #4f46e5 !important;
                    color: #ffffff !important;
                    box-shadow: 0 0 10px rgba(79, 70, 229, 0.5);
                }

                /* Entradas de Texto (InputText) */
                .cinevo-input {
                    background-color: #07080e !important;
                    border: 1px solid #1e2235 !important;
                    color: #f8fafc !important;
                    border-radius: 8px !important;
                    padding: 10px 12px !important;
                }
                .cinevo-input:focus {
                    border-color: #6366f1 !important;
                    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25) !important;
                }

                /* Diálogos y Modales */
                .p-dialog {
                    border-radius: 12px !important;
                    overflow: hidden;
                    border: 1px solid #1e2235 !important;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.9) !important;
                }
                .p-dialog .p-dialog-header {
                    background-color: #07080e !important;
                    color: #f8fafc !important;
                    border-bottom: 1px solid #1e2235 !important;
                }
                .p-dialog .p-dialog-content {
                    background-color: #07080e !important;
                    color: #f8fafc !important;
                }
                .p-dialog .p-dialog-footer {
                    background-color: #07080e !important;
                    border-top: 1px solid #1e2235 !important;
                }

                /* Menú Desplegable Pop-up */
                .p-menu {
                    background-color: #0d0e17 !important;
                    border: 1px solid #1e2235 !important;
                    border-radius: 8px !important;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.7) !important;
                }
                .p-menu .p-menuitem-link {
                    color: #f8fafc !important;
                }
                .p-menu .p-menuitem-link:hover {
                    background-color: #1a1d2e !important;
                }

                .form-field {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    margin-bottom: 16px;
                }
            `}</style>

            <Menu model={itemsMenu} popup ref={menuRef} />

            <DataTable
                value={Array.isArray(clientes) ? clientes : []}
                stripedRows
                paginator
                rows={5}
                header={headerTabla}
                globalFilter={globalFilter}
                globalFilterFields={["idCliente", "soloNombre", "soloApellido", "email"]}
                emptyMessage="No se encontraron coincidencias"
            >
                <Column field="idCliente" header="Código" sortable />
                <Column field="soloNombre" header="Nombres" />
                <Column field="soloApellido" header="Apellidos" />
                <Column field="email" header="Correo" />
                <Column body={actionBodyTemplate} style={{ width: "3rem" }} />
            </DataTable>

            {/* MODAL: CREAR CLIENTE */}
            <Dialog
                header="Registrar Nuevo Cliente"
                visible={mostrarModalCrear}
                style={{ width: "380px" }}
                onHide={() => setMostrarModalCrear(false)}
                footer={
                    <div>
                        <Button label="Cancelar" icon="pi pi-times" text onClick={() => setMostrarModalCrear(false)} style={{ color: "#94a3b8" }} />
                        <Button label="Crear" icon="pi pi-check" onClick={guardarNuevoCliente} style={{ backgroundColor: "#4f46e5", borderColor: "#4f46e5", borderRadius: "8px" }} />
                    </div>
                }
            >
                <div style={{ paddingTop: "10px" }}>
                    <div className="form-field">
                        <label htmlFor="nombreCrear" style={{ fontWeight: "600", fontSize: "0.85rem", color: "#94a3b8" }}>Nombre</label>
                        <InputText
                            id="nombreCrear"
                            className="cinevo-input"
                            value={formCrear.nombre}
                            onChange={(e) => setFormCrear({ ...formCrear, nombre: e.target.value })}
                            placeholder="Ej: María"
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="apellidoCrear" style={{ fontWeight: "600", fontSize: "0.85rem", color: "#94a3b8" }}>Apellido</label>
                        <InputText
                            id="apellidoCrear"
                            className="cinevo-input"
                            value={formCrear.apellido}
                            onChange={(e) => setFormCrear({ ...formCrear, apellido: e.target.value })}
                            placeholder="Ej: López"
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="emailCrear" style={{ fontWeight: "600", fontSize: "0.85rem", color: "#94a3b8" }}>Correo electrónico</label>
                        <InputText
                            id="emailCrear"
                            className="cinevo-input"
                            value={formCrear.email}
                            onChange={(e) => setFormCrear({ ...formCrear, email: e.target.value })}
                            placeholder="ejemplo@correo.com"
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="contrasenaCrear" style={{ fontWeight: "600", fontSize: "0.85rem", color: "#94a3b8" }}>Contraseña</label>
                        <InputText
                            id="contrasenaCrear"
                            type="password"
                            className="cinevo-input"
                            value={formCrear.contrasena}
                            onChange={(e) => setFormCrear({ ...formCrear, contrasena: e.target.value })}
                            placeholder="••••••••"
                        />
                    </div>
                </div>
            </Dialog>

            {/* MODAL: ACTUALIZAR DATOS */}
            <Dialog
                header="Actualizar Cliente"
                visible={mostrarModalEditar}
                style={{ width: "380px" }}
                onHide={() => setMostrarModalEditar(false)}
                footer={
                    <div>
                        <Button label="Cancelar" icon="pi pi-times" text onClick={() => setMostrarModalEditar(false)} style={{ color: "#94a3b8" }} />
                        <Button label="Aceptar" icon="pi pi-check" onClick={guardarActualizacion} style={{ backgroundColor: "#10b981", borderColor: "#10b981", borderRadius: "8px" }} />
                    </div>
                }
            >
                <div style={{ paddingTop: "10px" }}>
                    <div className="form-field">
                        <label htmlFor="nombreEdit" style={{ fontWeight: "600", fontSize: "0.85rem", color: "#94a3b8" }}>Nombre</label>
                        <InputText
                            id="nombreEdit"
                            className="cinevo-input"
                            value={formEditar.nombre}
                            onChange={(e) => setFormEditar({ ...formEditar, nombre: e.target.value })}
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="apellidoEdit" style={{ fontWeight: "600", fontSize: "0.85rem", color: "#94a3b8" }}>Apellido</label>
                        <InputText
                            id="apellidoEdit"
                            className="cinevo-input"
                            value={formEditar.apellido}
                            onChange={(e) => setFormEditar({ ...formEditar, apellido: e.target.value })}
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="emailEdit" style={{ fontWeight: "600", fontSize: "0.85rem", color: "#94a3b8" }}>Correo electrónico</label>
                        <InputText
                            id="emailEdit"
                            className="cinevo-input"
                            value={formEditar.email}
                            onChange={(e) => setFormEditar({ ...formEditar, email: e.target.value })}
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="contrasenaEdit" style={{ fontWeight: "600", fontSize: "0.85rem", color: "#94a3b8" }}>Contraseña</label>
                        <InputText
                            id="contrasenaEdit"
                            type="password"
                            className="cinevo-input"
                            value={formEditar.contrasena}
                            onChange={(e) => setFormEditar({ ...formEditar, contrasena: e.target.value })}
                            placeholder="••••••••"
                        />
                    </div>
                </div>
            </Dialog>

            {/* MODAL: ELIMINAR CLIENTE */}
            <Dialog
                header="Confirmar Eliminación"
                visible={mostrarModalEliminar}
                style={{ width: "350px" }}
                onHide={() => setMostrarModalEliminar(false)}
                footer={
                    <div>
                        <Button label="No" icon="pi pi-times" text onClick={() => setMostrarModalEliminar(false)} style={{ color: "#94a3b8" }} />
                        <Button label="Sí, eliminar" icon="pi pi-trash" onClick={confirmarEliminacion} style={{ backgroundColor: "#ef4444", borderColor: "#ef4444", borderRadius: "8px" }} />
                    </div>
                }
            >
                <div style={{ padding: "10px 0", color: "#f8fafc" }}>
                    <p>¿Está seguro de que desea eliminar al cliente <strong>{clienteSeleccionado?.soloNombre} {clienteSeleccionado?.soloApellido}</strong> (ID: {clienteSeleccionado?.idCliente})?</p>
                </div>
            </Dialog>
        </div>
    );
}

export default ClienteTable;