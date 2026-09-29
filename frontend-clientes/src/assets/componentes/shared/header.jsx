import { Toolbar } from "primereact/toolbar";

function Header() {
  const leftContent = (
    <div className="flex align-items-center">
      <i
        className="pi pi-users"
        style={{
          fontSize: "2rem",
          color: "#0d6efd",
          marginRight: "10px",
        }}
      />
      <h2 style={{ margin: 0 }}>
        Sistema de Gestión</h2>
    </div>
  );

  return (
    <Toolbar
      left={leftContent}
      style={{
        marginBottom: "20px",
      }}
    />
  );
}

export default Header;