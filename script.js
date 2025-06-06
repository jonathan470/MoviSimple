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

  class GraphSimple {
    constructor(n) {
      this.n = n;
      this.adj = Array(n)
        .fill(null)
    }

    addEdge(u, v, w) {
      this.adj[u].push({ node: v, weight: w });
    }
  }
    dijkstraSimple(source) {
      const dist = Array(this.n).fill(Infinity);
      const prev = Array(this.n).fill(null); // Para reconstruir predecesores
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
            dist[v] = dist[u] + w; 
            prev[v] = u;
          }
        }
      }
      return { dist, prev }; // Retorna distancias y predecesores
    }
  }

  const graph = new GraphSimple(NUM_NODES);
  EDGES.forEach((edge) => graph.addEdge(edge[0], edge[1], edge[2]));

  // Navegación UI
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

  // Gestión de Usuarios
  function saveUsers() {
    localStorage.setItem("moviSimpleUsers", JSON.stringify(users)); // Guardado en localStorage
  }

  registerButton.addEventListener("click", () => {
    const name = regNameInput.value.trim();
    const email = regEmailInput.value.trim();
    const password = regPasswordInput.value.trim(); 

    if (!name || !email || !password) {
      alert("Por favor, complete todos los campos.");
      return;
    }
    if (users.find((user) => user.email === email)) {
      alert("Un usuario con este correo electrónico ya existe.");
      return;
    }
    users.push({ name, email, password: hashed_${password} });
    saveUsers();
    alert("¡Registro exitoso! Por favor, inicie sesión."); 
    showScreen("login");
    regNameInput.value = "";
    regEmailInput.value = "";
    regPasswordInput.value = "";
  });
  loginButton.addEventListener("click", () => {
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value.trim(); 

    const user = users.find(
      (u) => u.email === email && u.password === hashed_${password}
    );
    if (user) {
      currentUser = user;
      welcomeMessage.textContent = ¡Bienvenido, ${currentUser.name}!;
      showScreen("trip");
      setupTripScreen(); // CA2, CA3 (mapa se muestra)
      loginEmailInput.value = "";
      loginPasswordInput.value = "";
    } else {
      alert("Correo electrónico o contraseña no válidos.");
    }
  });

  logoutButton.addEventListener("click", () => {
    currentUser = null;
    showScreen("login");
    resetTripInterfaceFull();
  });

  // Configuración de Pantalla de Viaje 
  function setupTripScreen() {
    mapContainer.innerHTML = "";
    originSelect.innerHTML = "";
    destinationSelect.innerHTML = "";

    for (let i = 0; i < NUM_NODES; i++) {
      // Nodos del mapa
      const nodeEl = document.createElement("div");
      nodeEl.classList.add("node");
      nodeEl.textContent = N${i}; // Nodos numerados 0-5
      nodeEl.dataset.nodeId = i;
      nodeEl.addEventListener("click", () => handleNodeClick(i, nodeEl));
      mapContainer.appendChild(nodeEl);

      // Opciones de selección
      const optionOrigin = document.createElement("option");
      optionOrigin.value = i;
      optionOrigin.textContent = Nodo ${i};
      originSelect.appendChild(optionOrigin);

      const optionDest = document.createElement("option");
      optionDest.value = i;
      optionDest.textContent = Nodo ${i};
      destinationSelect.appendChild(optionDest);
    }
    if (NUM_NODES > 0) {
      originSelect.value = "0";
      handleNodeSelectionChange(0, "origin");
      destinationSelect.value = NUM_NODES > 1 ? "1" : "0";
      handleNodeSelectionChange(NUM_NODES > 1 ? 1 : 0, "destination");
    }
    resetTripInterface();
  }

  function handleNodeClick(nodeId, nodeEl) {
    if (
      selectedOriginNode === null ||
      (selectedOriginNode !== null && selectedDestinationNode !== null)
    ) {
      clearNodeSelections();
      selectedOriginNode = nodeId;
      nodeEl.classList.add("selected-origin");
      originSelect.value = nodeId;
    } else if (
      selectedDestinationNode === null &&
      selectedOriginNode !== nodeId
    ) {
      selectedDestinationNode = nodeId;
      nodeEl.classList.add("selected-destination");
      destinationSelect.value = nodeId;
    }
    // Nodos cambian de color al seleccionarse
  }

  function handleNodeSelectionChange(nodeId, type) {
    nodeId = parseInt(nodeId);
    clearNodeSelectionsVisual();

    if (type === "origin") {
      selectedOriginNode = nodeId;
    } else {
      selectedDestinationNode = nodeId;
    }

    const nodeElements = mapContainer.querySelectorAll(".node");
    nodeElements.forEach((el) => {
      const id = parseInt(el.dataset.nodeId);
      if (id === selectedOriginNode) {
        el.classList.add("selected-origin");
      }
      if (id === selectedDestinationNode) {
        el.classList.add("selected-destination");
      }
    });
    // Nodos cambian de color al seleccionarse
  }

  originSelect.addEventListener("change", (e) =>
    handleNodeSelectionChange(e.target.value, "origin")
  );
  destinationSelect.addEventListener("change", (e) =>
    handleNodeSelectionChange(e.target.value, "destination")
  );

  function clearNodeSelectionsVisual() {
    const nodeElements = mapContainer.querySelectorAll(".node");
    nodeElements.forEach((el) => {
      el.classList.remove(
        "selected-origin",
        "selected-destination",
        "path-node"
      );
    });
  }

  function clearNodeSelections() {
    clearNodeSelectionsVisual();
    selectedOriginNode = null;
    selectedDestinationNode = null;
  }
  });
