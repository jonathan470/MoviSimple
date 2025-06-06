document.addEventListener("DOMContentLoaded", () => {
  // --- Elementos del DOM ---
  const screens = {
    register: document.getElementById("registerScreen"),
    login: document.getElementById("loginScreen"),
    trip: document.getElementById("tripScreen"),
  };

  //Registro
  const regNameInput = document.getElementById("regName");
  const regEmailInput = document.getElementById("regEmail");
  const regPasswordInput = document.getElementById("regPassword");
  const registerButton = document.getElementById("registerButton");
  const showLoginLink = document.getElementById("showLoginLink");

  //Inicio de sesión
  const loginEmailInput = document.getElementById("loginEmail");
  const loginPasswordInput = document.getElementById("loginPassword");
  const loginButton = document.getElementById("loginButton");
  const showRegisterLink = document.getElementById("showRegisterLink");

  //Pantalla de Viaje
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

  //Estado de la Aplicación
  let currentUser = null;
  let users = JSON.parse(localStorage.getItem("moviSimpleUsers")) || [];
  let selectedOriginNode = null;
  let selectedDestinationNode = null;
  const NUM_NODES = 6;
  //Tarifa por segundo
  const FARE_PER_SECOND = 0.5;

  //Definición del Grafo
  //[u, v, w] donde u y v son índices de nodos, w es el peso en segundos
  //9 aristas definidas
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
  ];

  //Clase GraphSimple
  class GraphSimple {
    constructor(n) {
      this.n = n;
      this.adj = Array(n)
        .fill(null)
        .map(() => []); //Lista de adyacencia
    }

    addEdge(u, v, w) {
      this.adj[u].push({ node: v, weight: w });
      this.adj[v].push({ node: u, weight: w }); //Conexión bidireccional 
    }
  }
  // Algoritmo de Dijkstra "simple" [cite: 2, 9]
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
    users.push({ name, email, password: `hashed_${password}` });
    saveUsers();
    alert("¡Registro exitoso! Por favor, inicie sesión."); // CA1
    showScreen("login");
    regNameInput.value = "";
    regEmailInput.value = "";
    regPasswordInput.value = "";
  });
  loginButton.addEventListener("click", () => {
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value.trim(); // [cite: 5]

    const user = users.find(
      (u) => u.email === email && u.password === `hashed_${password}`
    );
    if (user) {
      currentUser = user;
      welcomeMessage.textContent = `¡Bienvenido, ${currentUser.name}!`;
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

  // --- Configuración de Pantalla de Viaje ---
  function setupTripScreen() {
    mapContainer.innerHTML = "";
    originSelect.innerHTML = "";
    destinationSelect.innerHTML = "";

    for (let i = 0; i < NUM_NODES; i++) {
      // Nodos del mapa
      const nodeEl = document.createElement("div");
      nodeEl.classList.add("node");
      nodeEl.textContent = `N${i}`; // Nodos numerados 0-5 [cite: 8]
      nodeEl.dataset.nodeId = i;
      nodeEl.addEventListener("click", () => handleNodeClick(i, nodeEl));
      mapContainer.appendChild(nodeEl);

      // Opciones de selección
      const optionOrigin = document.createElement("option");
      optionOrigin.value = i;
      optionOrigin.textContent = `Nodo ${i}`;
      originSelect.appendChild(optionOrigin);

      const optionDest = document.createElement("option");
      optionDest.value = i;
      optionDest.textContent = `Nodo ${i}`;
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
    // CA4: Nodos cambian de color al seleccionarse [cite: 9]
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
    // CA4: Nodos cambian de color al seleccionarse [cite: 9]
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
  // --- Cálculo y Visualización de Ruta ---
  calculateRouteButton.addEventListener("click", () => {
    if (selectedOriginNode === null || selectedDestinationNode === null) {
      alert("Por favor, seleccione origen y destino.");
      return;
    }
    if (selectedOriginNode === selectedDestinationNode) {
      alert("El origen y el destino no pueden ser iguales.");
      return;
    }

    // CA5 (el grafo ya está construido con aristas y pesos) [cite: 7]
    const { dist, prev } = graph.dijkstraSimple(selectedOriginNode); // CA6 (Dijkstra calcula distancias) [cite: 9]

    const path = [];
    let currentNode = selectedDestinationNode;
    while (currentNode !== null && currentNode !== undefined) {
      path.unshift(currentNode);
      if (currentNode === selectedOriginNode) break;
      currentNode = prev[currentNode];
      if (path.length > NUM_NODES) {
        alert("Error reconstruyendo la ruta o no se encontró la ruta.");
        resetTripInterface();
        return;
      }
    } // Reconstruir la ruta mínima [cite: 10]

    if (
      path.length === 0 ||
      path[0] !== selectedOriginNode ||
      dist[selectedDestinationNode] === Infinity
    ) {
      routeText.textContent = "No se encontró ruta.";
      timeText.textContent = "";
      costText.textContent = "";
      resetTripButton.style.display = "block";
      calculateRouteButton.style.display = "none";
      return;
    }

    const totalTime = dist[selectedDestinationNode];
    const totalCost = totalTime * FARE_PER_SECOND; // [cite: 11]

    routeText.textContent = `Ruta: ${path.map((n) => `N${n}`).join(" -> ")}`;
    timeText.textContent = `Tiempo total: ${totalTime} segundos`; // [cite: 12]
    costText.textContent = `Costo: $${totalCost.toFixed(2)}`; // CA8 (Se calcula y muestra el costo) [cite: 12]

    tripInfoDiv.style.display = "block";
    animationContainer.style.display = "block";
    calculateRouteButton.style.display = "none";
    resetTripButton.style.display = "block";

    animatePath(path, totalTime); // CA7 (Ruta óptima se dibuja y anima) [cite: 10]
  });
  // --- Animación ---
  function animatePath(path, totalTime) {
    let currentPathIndex = 0;
    let accumulatedTime = 0;
    progressBarFill.style.width = "0%";
    currentNodeDisplay.textContent = Iniciando en N${path[0]};

    clearNodeSelectionsVisual();
    const nodeElements = mapContainer.querySelectorAll(".node");

    function highlightCurrentNode() {
      // Parte de "dibujarla sobre el mapa" [cite: 10]
      nodeElements.forEach((el) => el.classList.remove("path-node"));
      const nodeToHighlight = path[currentPathIndex];
      const elToHighlight = Array.from(nodeElements).find(
        (el) => parseInt(el.dataset.nodeId) === nodeToHighlight
      );
      if (elToHighlight) {
        elToHighlight.classList.add("path-node");
      }
    }

    highlightCurrentNode();

    function stepAnimation() {
      // Barra de progreso que avance entre nodos, respetando el peso en segundos [cite: 10]
      if (currentPathIndex < path.length - 1) {
        const u = path[currentPathIndex];
        const v = path[currentPathIndex + 1];

        let edgeWeight = 0;
        const edgeData = graph.adj[u].find((e) => e.node === v);
        if (edgeData) {
          edgeWeight = edgeData.weight;
        } else {
          console.error(Arista no encontrada entre ${u} y ${v});
          finalizeAnimation();
          return;
        }

        accumulatedTime += edgeWeight;
        const progressPercentage = (accumulatedTime / totalTime) * 100;
        progressBarFill.style.width = ${progressPercentage}%;
        currentNodeDisplay.textContent = Viajando a N${v}... (Segmento: ${edgeWeight}s);

        setTimeout(() => {
          currentPathIndex++;
          highlightCurrentNode();
          if (currentPathIndex === path.length - 1) {
            currentNodeDisplay.textContent = ¡Llegada a N${path[currentPathIndex]}!;
            setTimeout(finalizeAnimation, 1000);
          } else {
            stepAnimation();
          }
        }, edgeWeight * 500); // Escalar tiempo para animación (ej. 500ms por segundo de peso)
      }
    }

    if (path.length > 1) {
      setTimeout(stepAnimation, 500);
    } else {
      currentNodeDisplay.textContent = En N${path[0]};
      progressBarFill.style.width = "100%";
      finalizeAnimation();
    }
  }

  function finalizeAnimation() {
    currentNodeDisplay.textContent = Viaje Completado! ${timeText.textContent};
    // El reinicio de la interfaz se maneja con el botón "Nuevo Viaje" [cite: 12]
  }
});
