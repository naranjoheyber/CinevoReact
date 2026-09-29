import React from 'react';
import ReactDOM from 'react-dom/client';

import App from "./App";

// PrimeReact

import 'primereact/resources/themes/lara-light-blue/theme.css';

import 'primeicons/primeicons.css';

// Estilos propios

import './assets/styles/app.css';

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);