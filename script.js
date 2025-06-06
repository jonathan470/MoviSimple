document.addEventListener("DOMContentLoaded", () => {
  // --- Elementos del DOM ---
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

  // --- Estado de la Aplicación ---
  let currentUser = null;
  let users = JSON.parse(localStorage.getItem("moviSimpleUsers")) || [];
  let selectedOriginNode = null;
  let selectedDestinationNode = null;
  const NUM_NODES = 6;
  const FARE_PER_SECOND = 0.5; // Tarifa por segundo [cite: 11]

  // --- Definición del Grafo ---
  // [u, v, w] donde u y v son índices de nodos, w es el peso en segundos [cite: 7]
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
  ]; // 9 aristas definidas [cite: 6]

  // --- Clase GraphSimple --- [cite: 2]
  class GraphSimple {
    constructor(n) {
      this.n = n;
      this.adj = Array(n)
        .fill(null)
        .map(() => []); // Lista de adyacencia [cite: 21]
    }

    addEdge(u, v, w) {
      this.adj[u].push({ node: v, weight: w });
      this.adj[v].push({ node: u, weight: w }); // Conexión bidireccional [cite: 7]
    }
  }
    dijkstraSimple(source) {
      const dist = Array(this.n).fill(Infinity);
      const prev = Array(this.n).fill(null); // Para reconstruir predecesores [cite: 9]
      const visited = Array(this.n).fill(false);

      dist[source] = 0;

      for (let count = 0; count < this.n; count++) {
        let u = -1;
        // Encontrar nodo no visitado con la menor distancia
        for (let j = 0; j < this.n; j++) {
          if (!visited[j] && (u === -1 || dist[j] < dist[u])) {
            u = j;
          }
        }

        if (u === -1 || dist[u] === Infinity) break;

        visited[u] = true;

        for (const edge of this.adj[u]) {
          const v = edge.node;
          const w = edge.weight;
          if (!visited[v] && dist[u] + w < dist[v]) {
            dist[v] = dist[u] + w; // [cite: 22]
            prev[v] = u;
          }
        }
      }
      return { dist, prev }; // Retorna distancias y predecesores [cite: 9]
    }
  }

  const graph = new GraphSimple(NUM_NODES);
  EDGES.forEach((edge) => graph.addEdge(edge[0], edge[1], edge[2]));

  // --- Navegación UI ---
  function showScreen(screenName) {
    Object.values(screens).forEach((screen) => (screen.style.display = "none"));
    screens[screenName].style.display = "flex";
  }

  showLoginLink.addEventListener("click", (e) => {
    e.preventDefault();
    showScreen("login");
  });
  showRegisterLink.addEventListener("click", (e) => {
    e.preventDefault();
    showScreen("register");
  });

  // --- Gestión de Usuarios ---
  function saveUsers() {
    localStorage.setItem("moviSimpleUsers", JSON.stringify(users)); // Guardado en localStorage en lugar de users.txt [cite: 6]
  }

  registerButton.addEventListener("click", () => {
    const name = regNameInput.value.trim();
    const email = regEmailInput.value.trim();
    const password = regPasswordInput.value.trim(); // [cite: 5]

    if (!name || !email || !password) {
      alert("Por favor, complete todos los campos.");
      return;
    }
    if (users.find((user) => user.email === email)) {
      alert("Un usuario con este correo electrónico ya existe.");
      return;
    }
    // "Hashing" simple de contraseña para demostración; usar bcrypt en producción
    users.push({ name, email, password: hashed_${password} });
    saveUsers();
    alert("¡Registro exitoso! Por favor, inicie sesión."); // CA1
    showScreen("login");
    regNameInput.value = "";
    regEmailInput.value = "";
    regPasswordInput.value = "";
  });
