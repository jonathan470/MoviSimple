document.addEventListener("DOMContentLoaded", () => {
  // Elementos del DOM 
  const screens = {
    register: document.getElementById("registerScreen"),
    login: document.getElementById("loginScreen"),
    trip: document.getElementById("tripScreen"),
  };

  // Registro
  const regNameInput = document.getElementById("regName");
  const regEmailInput = document.getElementById("regEmail");
  const regPasswordInput = document.getElementById("regPassword");
  const registerButton = document.getElementById("registerButton");
  const showLoginLink = document.getElementById("showLoginLink");

  // Inicio de sesión
  const loginEmailInput = document.getElementById("loginEmail");
  const loginPasswordInput = document.getElementById("loginPassword");
  const loginButton = document.getElementById("loginButton");
  const showRegisterLink = document.getElementById("showRegisterLink");

  // Pantalla de Viaje
  const welcomeMessage = document.getElementById("welcomeMessage");
  const mapContainer = document.getElementById("mapContainer");
  const originSelect = document.getElementById("originSelect");
  const destinationSelect = document.getElementById("destinationSelect");
  const calculateRouteButton = document.getElementById("calculateRouteButton");
  const routeText = document.getElementById("routeText");
  const timeText = document.getElementById("timeText");
  const costText = document.getElementById("costText");
  const animationContainer = document.getElementById("animationContainer");
  const progressBarFill = document.getElementById("progressBarFill");
  const currentNodeDisplay = document.getElementById("currentNodeDisplay");
  const logoutButton = document.getElementById("logoutButton");
  const resetTripButton = document.getElementById("resetTripButton");
  const tripInfoDiv = document.getElementById("tripInfo");

  // Estado de la Aplicación
  let currentUser = null;
  let users = JSON.parse(localStorage.getItem("moviSimpleUsers")) || [];
  let selectedOriginNode = null;
  let selectedDestinationNode = null;
  const NUM_NODES = 6;
  const FARE_PER_SECOND = 0.5; // Tarifa por segundo

  // Definición del Grafo
  // [u, v, w] donde u y v son índices de nodos, w es el peso en segundos
  const EDGES = [
    [0, 1, 5],
    [0, 2, 7],
    [1, 3, 4],
    [1, 4, 6],
    [2, 3, 3],
    [2, 5, 8],
    [3, 4, 2],
    [3, 5, 9],
    [4, 5, 4],
  ]; // 9 aristas definidas 

  //Clase GraphSimple 
  class GraphSimple {
    constructor(n) {
      this.n = n;
      this.adj = Array(n)
        .fill(null)
        .map(() => []); // Lista de adyacencia
    }

    addEdge(u, v, w) {
      this.adj[u].push({ node: v, weight: w });
      this.adj[v].push({ node: u, weight: w }); // Conexión bidireccional
    }
  }
});
