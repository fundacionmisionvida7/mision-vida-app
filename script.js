import { 
  storage,
  onAuthStateChange,
  auth,
  db,
  loginWithGoogle,
  registerWithEmail,
  loginAnonymously,
  loginWithEmail,  // Añade esta importación
  logout  // Añade esta importación
} from './auth.js';


import { uploadBytes } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-storage.js";
import { getStorage, ref, listAll, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-storage.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";



//import fetch from "node-fetch";
//import { JSDOM } from "jsdom";



/////////////////////////////////////////////
// Función para cargar la imagen de perfil
/////////////////////////////////////////////
async function loadProfileImage() {
  const user = auth.currentUser;
  const profileImg = document.getElementById('userPhoto');

  if (!profileImg) return;
  
  if (!user) {
    profileImg.src = 'https://firebasestorage.googleapis.com/v0/b/mision-vida-app.appspot.com/o/FotosPerfil%2Fimagen-default.jpg?alt=media';
    return;
  }

  const userId = user.uid;
  // Modificar la ruta para incluir un subdirectorio con el userId
  const storageRef = ref(storage, `FotosPerfil/${userId}/profile.jpg`);

  try {
    const url = await getDownloadURL(storageRef);
    profileImg.src = url;
  } catch (error) {
    console.error('Error al cargar la imagen de perfil:', error);
    profileImg.src = 'https://firebasestorage.googleapis.com/v0/b/mision-vida-app.appspot.com/o/FotosPerfil%2Fimagen-default.jpg?alt=media';
  }
}








/////////////////////////
// Galeria de imagenes
//////////////////////////
// Función para mostrar imagen en grande




// Función para mostrar la imagen en un modal al hacer clic
function showImageModal(event) {
  const imgSrc = event.target.src;
  const modalImage = document.getElementById('modalImage');
  modalImage.src = imgSrc;

  // Mostrar el modal
  const imageModal = new bootstrap.Modal(document.getElementById('imageModal'));
  imageModal.show();
}

// Cargar imágenes de la galería y agregar eventos de clic
async function loadGalleryImages() {
  const storageRef = ref(storage, 'GaleriaFotos/GaleriaDeImagenes');
  const galleryGrid = document.querySelector('.gallery-grid');
  galleryGrid.innerHTML = '<p>Cargando imágenes...</p>';

  try {
    const result = await listAll(storageRef);
    galleryGrid.innerHTML = ''; 

    if (result.items.length === 0) {
      galleryGrid.innerHTML = '<p>No hay imágenes disponibles.</p>';
      return;
    }

    for (const itemRef of result.items) {
      try {
        const url = await getDownloadURL(itemRef);
        const imgElement = document.createElement('img');
        imgElement.src = url;
        imgElement.alt = 'Imagen de la galería';
        imgElement.classList.add('gallery-item'); // Asegurar que tenga la clase
        imgElement.style.cursor = 'pointer'; // Indicar que es clickeable
        imgElement.addEventListener('click', showImageModal); // Agregar evento de clic

        galleryGrid.appendChild(imgElement);
      } catch (urlError) {
        console.error('Error al obtener el URL de la imagen:', urlError);
      }
    }
  } catch (error) {
    console.error('Error al listar las imágenes:', error);
    galleryGrid.innerHTML = '<p>Error al cargar las imágenes. Intenta nuevamente más tarde.</p>';
  }
}

// Cargar la galería cuando se abre el modal de Comunidad
document.querySelector('[data-bs-target="#communityModal"]').addEventListener('click', loadGalleryImages);



/////////////////////////////////////////////////
// Cargar imagen de perfil al cargar la página
/////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', loadProfileImage);

// Cargar la galería cuando se abre el modal
document.querySelector('[data-bs-target="#communityModal"]').addEventListener('click', loadGalleryImages);






  
document.addEventListener('DOMContentLoaded', function() {
  // Mostrar modal de login al cargar la página si no hay sesión activa
  const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
  
  // Manejo del estado de autenticación
  onAuthStateChange((user) => {
    checkLiveStream(true); // Verificar automáticamente al cargar la página

    if (user) {
      updateUIWithUserData(user);
      loginModal.hide();
    } else {
      loginModal.show();
    }

    const overlay = document.getElementById('overlay');
  
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('hidden.bs.modal', () => {
        overlay.classList.remove('active'); // Oculta el overlay al cerrar cualquier modal
        document.body.style.overflow = ''; // Restablece el scroll
      });
    });

  });







  function updateUIWithUserData(user) {
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userPhoto = document.getElementById('userPhoto');

    userName.textContent = user.displayName || 'Usuario Anónimo';
    userEmail.textContent = user.email || 'Anónimo';
    userPhoto.src = user.photoURL || 'https://firebasestorage.googleapis.com/v0/b/mision-vida-app.appspot.com/o/FotosPerfil%2Fimagen-default.jpg?alt=media';
}

  // Manejo del sidebar y overlay
  const sidebar = document.getElementById('sidebar');
  const sidebarCollapse = document.getElementById('sidebarCollapse');
  const content = document.getElementById('content');
  const overlay = document.getElementById('overlay');

  // Función para toggle del sidebar
  function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
  
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
  
    // Solo bloquear el scroll si el sidebar está activo
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
  }
  

  sidebarCollapse.addEventListener('click', toggleSidebar);
  overlay.addEventListener('click', toggleSidebar);

  // Soporte para gestos de deslizamiento en móviles
  let touchStartX = 0;
  let touchEndX = 0;

  document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, false);

  document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, false);

  function handleSwipe() {
    const swipeDistance = touchEndX - touchStartX;
    const threshold = 50; // Distancia mínima para considerar un swipe

    if (Math.abs(swipeDistance) < threshold) return;

    if (swipeDistance > 0 && touchStartX < 30) {
      // Swipe derecha desde el borde izquierdo
      sidebar.classList.add('active');
      overlay.classList.add('active');
    } else if (swipeDistance < 0 && sidebar.classList.contains('active')) {
      // Swipe izquierda cuando el sidebar está abierto
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
    }
  }

  // Cerrar sidebar al hacer click fuera de él en dispositivos móviles
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
      if (!sidebar.contains(e.target) && !sidebarCollapse.contains(e.target) && !overlay.contains(e.target)) {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
      }
    }
  });

  // Cambiar entre modales de login y registro
  const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
  const showRegisterBtn = document.getElementById('showRegisterBtn');

  showRegisterBtn.addEventListener('click', () => {
    loginModal.hide();
    registerModal.show();
  });

  // Manejo del formulario de login
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
      await loginWithEmail(email, password);
    } catch (error) {
      alert('Error al iniciar sesión: ' + error.message);
    }
  });

  // Manejo del formulario de registro
  const registerForm = document.getElementById('registerForm');
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
      await registerWithEmail(email, password);
      registerModal.hide();
    } catch (error) {
      alert('Error al registrarse: ' + error.message);
    }
  });

  // Manejo del inicio de sesión con Google
  document.getElementById('googleLoginBtn').addEventListener('click', async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      alert('Error al iniciar sesión con Google: ' + error.message);
    }
  });

  // Manejo del inicio de sesión anónimo
  document.getElementById('anonymousLoginBtn').addEventListener('click', async () => {
    try {
      await loginAnonymously();
    } catch (error) {
      alert('Error al iniciar sesión anónimamente: ' + error.message);
    }
  });

  // Manejo del cierre de sesión
  document.getElementById('logoutBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      await logout();
    } catch (error) {
      alert('Error al cerrar sesión: ' + error.message);
    }
  });
});

///////////////////////////
// Funcion de los botnes
///////////////////////////

// Yotube //
const API_KEY = 'AIzaSyDE1W0BGrYlSNJQWL8vczFiOn3vycIZ0lI'; // Reemplaza con tu API Key
const CHANNEL_ID = 'UC_cQTyQB4mDHiLU9qrWO_iA'; // Reemplaza con el ID del canal


async function checkLiveStream(autoCheck = false) {
  const liveUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&eventType=live&type=video&key=${API_KEY}`;
  const latestUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=1&order=date&type=video&key=${API_KEY}`;

  const modalContent = document.getElementById('modalContent');
  const modalTitle = document.getElementById('genericModalLabel');

  try {
    console.log("Consultando transmisiones en vivo...");
    const liveResponse = await fetch(liveUrl);
    const liveData = await liveResponse.json();

    if (liveData.items && liveData.items.length > 0) {
      // Hay transmisión en vivo
      const liveVideo = liveData.items[0];
      const liveLink = `https://www.youtube.com/watch?v=${liveVideo.id.videoId}`;

      modalTitle.textContent = 'Transmisión en Vivo';
      modalContent.innerHTML = `
        <p>¡Estamos en vivo ahora mismo! Haz clic en el enlace para unirte a la transmisión:</p>
        <a href="${liveLink}" target="_blank" class="btn btn-success">Ir a la Transmisión</a>
      `;

      if (autoCheck) {
        const modal = new bootstrap.Modal(document.getElementById('genericModal'));
        modal.show();
      }
    } else if (!autoCheck) {
      // Mostrar última transmisión solo si es una acción manual
      console.log("No hay transmisiones en vivo. Consultando el último video...");
      const latestResponse = await fetch(latestUrl);
      const latestData = await latestResponse.json();

      if (latestData.items && latestData.items.length > 0) {
        const latestVideo = latestData.items[0];
        const latestLink = `https://www.youtube.com/watch?v=${latestVideo.id.videoId}`;

        modalTitle.textContent = 'Última Transmisión';
        modalContent.innerHTML = `
          <p>No hay transmisiones en vivo en este momento. Aquí tienes la última transmisión disponible:</p>
          <a href="${latestLink}" target="_blank" class="btn btn-primary">Ver Última Transmisión</a>
        `;
      } else {
        modalTitle.textContent = 'Sin Transmisiones Disponibles';
        modalContent.innerHTML = '<p>No hay transmisiones en vivo ni grabadas disponibles en este momento. Por favor, vuelve más tarde.</p>';
      }
    }
  } catch (error) {
    console.error('Error al verificar la transmisión:', error);
    modalTitle.textContent = 'Error';
    modalContent.innerHTML = '<p>Hubo un problema al verificar las transmisiones. Intenta nuevamente más tarde.</p>';
  }
}


// Asignar evento al botón manual
document.getElementById('checkLiveButton').addEventListener('click', () => {
  checkLiveStream(false); // Abre el modal solo al presionar el botón
});




//////////////////////////
// Fotos de perfil
//////////////////////////
// Función para subir la imagen de perfil
document.getElementById('userPhoto').addEventListener('click', () => {
  document.getElementById('uploadProfileImage').click();
});

// Función para subir la imagen de perfil al servidor
async function uploadProfileImage(event) {
  const file = event.target.files[0];

  if (!file) return;

  const user = auth.currentUser;
  if (!user) {
    alert('Debes iniciar sesión para cambiar la foto de perfil.');
    return;
  }

  const userId = user.uid;
  const storageRef = ref(storage, `FotosPerfil/${userId}/profile.jpg`);

  try {
    await uploadBytes(storageRef, file);
    console.log('Imagen subida con éxito.');

    const url = await getDownloadURL(storageRef);
    document.getElementById('userPhoto').src = url;

    alert('Foto de perfil actualizada.');
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    // alert('No tienes permiso para subir esta imagen.');
  }
}






// Agregar evento de cambio al input de subir imagen
document.getElementById('uploadProfileImage').addEventListener('change', async (event) => {
  const file = event.target.files[0];

  if (!file) return;

  const user = auth.currentUser;
  if (!user) {
    const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
    document.getElementById('errorMessage').textContent = 'Debes iniciar sesión para cambiar la foto de perfil.';
    errorModal.show();
    return;
  }

  // Mostrar modal de carga
  const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
  loadingModal.show();

  const userId = user.uid;
  const storageRef = ref(storage, `FotosPerfil/${userId}/profile.jpg`);

  try {
    await uploadBytes(storageRef, file);
    console.log('Imagen subida con éxito.');

    const url = await getDownloadURL(storageRef);
    document.getElementById('userPhoto').src = url;

    // Ocultar modal de carga
    loadingModal.hide();
    
    // Mostrar modal de éxito
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    successModal.show();

  } catch (error) {
    console.error('Error al subir la imagen:', error);
    
    // Ocultar modal de carga
    loadingModal.hide();
    
    // Mostrar modal de error
    const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
    document.getElementById('errorMessage').textContent = 'Ha ocurrido un error al subir la imagen. Por favor, intenta nuevamente.';
    errorModal.show();
  }
});

// Detectar cambios de autenticación y cargar la imagen
onAuthStateChange(loadProfileImage);






//////////////////////////////////////////////////////////////////
// Función para cargar el devocional del día desde bibliaon.com
//////////////////////////////////////////////////////////////////
// ================== CONEXIÓN/ALERTAS ==================
// Función para mostrar notificación de conexión
function showConnectionToast(message, type = 'success') {
  const toast = new bootstrap.Toast(document.getElementById('connectionToast'));
  const toastBody = document.getElementById('connectionToastBody');
  
  toastBody.className = `toast-body bg-${type} text-white rounded`;
  toastBody.innerHTML = `
    <div class="d-flex align-items-center">
      <i class="bi ${type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2"></i>
      ${message}
    </div>
  `;
  toast.show();
  setTimeout(() => toast.hide(), 5000);
}

// Detectar cambios de conexión
window.addEventListener('online', () => {
  showConnectionToast('Conexión restablecida - Contenido actualizado', 'success');
  checkAndPrecacheDevotional(); // Recargar devocional al reconectar
});

window.addEventListener('offline', () => {
  showConnectionToast('Sin conexión a internet - Modo offline', 'warning');
});

// Verificar estado inicial
if (!navigator.onLine) {
  showConnectionToast('Modo offline activado', 'warning');
}

// ================== PRECACHE AUTOMÁTICO ==================
document.addEventListener('DOMContentLoaded', async () => {
  await checkAndPrecacheDevotional();
 // initApp(); // Tu función de inicialización de la app
});

async function checkAndPrecacheDevotional() {
  const today = getCurrentDateKey();
  const lastPrecache = localStorage.getItem('lastPrecache');
  
  if (lastPrecache !== today && navigator.onLine) {
    try {
      const data = await fetchDevotional();
      await updateCache(data);
      localStorage.setItem('lastPrecache', today);
      console.log('📦 Precarga diaria exitosa');
    } catch (error) {
      console.error('Error en precarga:', error);
    }
  }
}

// ================== CORE DEVOCIONAL ==================
async function loadDevotional() {
  try {
    // Primero intentar con caché
    const cachedData = await getCachedDevotional();
    if (cachedData) {
      if (navigator.onLine) backgroundUpdate();
      return cachedData;
    }
    
    // Si hay conexión, obtener fresco
    if (navigator.onLine) {
      const response = await fetch('https://palabra-del-dia-backend.vercel.app/devotional');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    }
    
    throw new Error('No hay conexión y ningún dato en caché');
    
  } catch (error) {
    throw new Error(error.message);
  }
}

// ================== FUNCIONES AUXILIARES ==================
async function fetchDevotional() {
  try {
    const response = await fetchWithTimeout(
      'https://palabra-del-dia-backend.vercel.app/devotional', 
      3000
    );
    return response;
  } catch (error) {
    const cached = await getCachedDevotional();
    return cached || Promise.reject(error);
  }
}

async function fetchWithTimeout(url, timeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timeoutId);
    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function updateCache(data) {
  const cache = await caches.open('palabra-del-dia-cache');
  await cache.put(
    new Request(`https://palabra-del-dia-backend.vercel.app/devotional?date=${getCurrentDateKey()}`),
    new Response(JSON.stringify(data))
  );
}

async function getCachedDevotional() {
  try {
    const cache = await caches.open('palabra-del-dia-cache');
    const response = await cache.match(
      `https://palabra-del-dia-backend.vercel.app/devotional?date=${getCurrentDateKey()}`
    );
    return response ? response.json() : null;
  } catch (error) {
    return null;
  }
}

function getCurrentDateKey() {
  return new Date().toISOString().split('T')[0];
}

async function backgroundUpdate() {
  try {
    const data = await fetchDevotional();
    await updateCache(data);
    console.log('🔄 Actualización en segundo plano exitosa');
  } catch (error) {
    console.log('⚠️ No se pudo actualizar en segundo plano');
  }
}




// ================== UI ==================
// Variable para almacenar los datos actuales del devocional
let currentDevotionalData = {};

// ================== UI ==================
function updateDevotionalUI(data) {
  currentDevotionalData = data; // Almacenar datos para compartir
  const devotionalContent = document.getElementById('devotionalContent');
  devotionalContent.innerHTML = `
    <h3 class="text-primary mb-3">${data.title}</h3>
    <div class="card">
      <div class="card-body">
        <p class="lead">${data.content}</p>
        <footer class="blockquote-footer mt-3">${data.date}</footer>
      </div>
    </div>
  `;
}

document.getElementById('openDevotionalButton').addEventListener('click', async () => {
  const modalElement = document.getElementById('devotionalModal');
  const modal = new bootstrap.Modal(modalElement);
  
  // Mostrar modal con estado de carga
  modal.show();
  
  try {
    // Mostrar animación de carga
    const devotionalContent = document.getElementById('devotionalContent');
    devotionalContent.innerHTML = `
      <div class="d-flex justify-content-center align-items-center" style="min-height: 200px">
        <div class="text-center">
          <div class="spinner-border text-primary mb-2"></div>
          <p>Cargando devocional...</p>
        </div>
      </div>
    `;

    // Cargar contenido real
    const data = await loadDevotional();
    updateDevotionalUI(data);
    
  } catch (error) {
    devotionalContent.innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle me-2"></i>
        ${error.message || 'No se pudo cargar el contenido'}
      </div>
    `;
  }
});

// ======== FUNCIONES DE COMPARTICIÓN =========
document.getElementById('shareWhatsApp').addEventListener('click', () => {
  if (!currentDevotionalData.title) return;
  
  // Limpiar el contenido HTML
  const cleanContent = stripHtmlTags(currentDevotionalData.content);
  
  const message = encodeURIComponent(
    `*${currentDevotionalData.title}*\n\n` +
    `${cleanContent}\n\n` +
    `Fecha: ${currentDevotionalData.date}\n` +
    `Fuente: Iglesia Cristiana Misión Vida`
  );
  
  window.open(`https://wa.me/?text=${message}`, '_blank');
});

document.getElementById('shareFacebook').addEventListener('click', () => {
  if (!currentDevotionalData.title) return;
  
  // Limpiar el contenido HTML
  const cleanContent = stripHtmlTags(currentDevotionalData.content);
  
  const quote = encodeURIComponent(
    `"${cleanContent}"\n\n` +
    `- ${currentDevotionalData.title}, ${currentDevotionalData.date}`
  );
  
  window.open(`https://www.facebook.com/sharer/sharer.php?quote=${quote}`, '_blank');
});

document.getElementById('copyText').addEventListener('click', () => {
  if (!currentDevotionalData.title) return;
  
  // Limpiar el contenido HTML
  const cleanContent = stripHtmlTags(currentDevotionalData.content);
  
  const text = 
    `*${currentDevotionalData.title}*\n\n` +
    `${cleanContent}\n\n` +
    `Fecha: ${currentDevotionalData.date}\n` +
    `Fuente: Iglesia Cristiana Misión Vida`;
  
  navigator.clipboard.writeText(text)
    .then(() => {
      alert('¡Texto copiado al portapapeles!');
    })
    .catch(err => {
      console.error('Error al copiar:', err);
      alert('Error al copiar el texto');
    });
});

  
  
// Función para remover etiquetas HTML
function stripHtmlTags(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}





////////////////////////////////////////////////////////////
// Función para cargar los recursos desde Firebase Storage
////////////////////////////////////////////////////////////

// Función para cargar los recursos desde Google Drive
function loadResources() {
  const resourcesContent = document.getElementById('resourcesContent');
  resourcesContent.innerHTML = '<p>Cargando recursos...</p>';
  // Lista de recursos con nombres y enlaces directos de descarga
  const resources = [
    { name: 'NuevaVidaEnCristo-vol- 1.pdf', url: 'https://drive.google.com/uc?export=download&id=1AEgs12gO9F-Klc5UridqpYbXsN3oLZtp' },
    { name: 'NuevaVidaEnCristo-vol- 2.pdf', url: 'https://drive.google.com/uc?export=download&id=1CDU9k8OF7SGFCy8DZkwTPlBIa6w_AQA8' },
    { name: 'NuevaVidaEnCristo-vol- 3.pdf', url: 'https://drive.google.com/uc?export=download&id=1PNA5zNT-4fXQRIKyO5570Jo4zWDB2H8v' },
    { name: 'NuevaVidaEnCristo-vol- 4.pdf', url: 'https://drive.google.com/uc?export=download&id=1KhdZ8PIfGb9gilkeA2rXYz8eMHLRvhNn' },
    { name: 'NuevaVidaEnCristo-vol- 5.pdf', url: 'https://drive.google.com/uc?export=download&id=1HuGyg-1JI07m_cPV-U7E5v3ZNDhWFabY' },
    { name: 'NuevaVidaEnCristo-vol- 6.pdf', url: 'https://drive.google.com/uc?export=download&id=1KKgk5ve5cK9AoLK7fXpyURnuRkhzqOI5' },
    { name: 'Volumen Evangelístico-vol- 7.pdf', url: 'https://drive.google.com/uc?export=download&id=1ZQeaUks1_LExPS1bF2uK9Z_46dc2GZFm' }
  ];
  if (resources.length === 0) {
    resourcesContent.innerHTML = '<p>No hay recursos disponibles.</p>';
    return;
  }
  resourcesContent.innerHTML = '';
  resources.forEach(resource => {
    const fileElement = document.createElement('div');
    fileElement.classList.add('resource-item', 'mb-3');
    fileElement.innerHTML = `
      <p>${resource.name}</p>
      <a href="${resource.url}" download="${resource.name}" class="btn btn-sm btn-success">Descargar</a>
    `;
    resourcesContent.appendChild(fileElement);
  });
}

// Asignar eventos al botón de recursos
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('openResourcesButton').addEventListener('click', () => {
    const resourcesModal = new bootstrap.Modal(document.getElementById('resourcesModal'));
    loadResources();
    resourcesModal.show();
  });
});





////////////////////////////////////////////////
// Función para cargar el eventos.
///////////////////////////////////////////////

// Función para cargar el evento más reciente
async function loadCurrentEvent() {
  const currentEventContainer = document.getElementById('currentEvent');
  currentEventContainer.innerHTML = '<p>Cargando evento...</p>';

  try {
    // Referencia a la carpeta de eventos nuevos
    const newEventsRef = ref(storage, 'eventos/EventosNuevos/');
    const result = await listAll(newEventsRef);

    if (result.items.length === 0) {
      currentEventContainer.innerHTML = '<p>No hay eventos nuevos disponibles.</p>';
      return;
    }

    // Obtener el último archivo (evento más reciente)
    const latestEventRef = result.items[result.items.length - 1];
    const url = await getDownloadURL(latestEventRef);
    const fileName = latestEventRef.name;

    // Determinar si es una imagen o un video
    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(fileName);
    const isVideo = /\.(mp4|webm|ogg)$/i.test(fileName);

    let mediaElement = '';
    if (isImage) {
      mediaElement = `<img src="${url}" alt="${fileName}" class="img-fluid" style="cursor: pointer;" />`;
    } else if (isVideo) {
      mediaElement = `
        <video controls class="w-100" style="cursor: pointer;">
          <source src="${url}" type="video/mp4">
          Tu navegador no soporta el elemento de video.
        </video>
      `;
    } else {
      mediaElement = '<p>Formato de archivo no compatible.</p>';
    }

    // Mostrar el evento más reciente
    currentEventContainer.innerHTML = `
      <h6>${removeFileExtension(fileName)}</h6>
      ${mediaElement}
    `;

    // Agregar evento de clic para ampliar la imagen/video
    const mediaElementNode = currentEventContainer.querySelector('img, video');
    if (mediaElementNode) {
      mediaElementNode.addEventListener('click', () => showEventMedia(url, fileName)); // Pasar el nombre completo
    }
  } catch (error) {
    console.error('Error al cargar el evento más reciente:', error);
    currentEventContainer.innerHTML = '<p>No se pudo cargar el evento más reciente. Inténtalo de nuevo más tarde.</p>';
  }
}

// Función para cargar eventos viejos
async function loadOldEvents() {
  const oldEventsContent = document.getElementById('oldEventsContent');
  oldEventsContent.innerHTML = '<p>Cargando eventos anteriores...</p>';

  try {
    // Referencia a la carpeta de eventos viejos
    const oldEventsRef = ref(storage, 'eventos/EventosViejos/');
    const result = await listAll(oldEventsRef);

    if (result.items.length === 0) {
      oldEventsContent.innerHTML = '<p>No hay eventos anteriores disponibles.</p>';
      return;
    }

    oldEventsContent.innerHTML = '';
    for (const itemRef of result.items) {
      try {
        const url = await getDownloadURL(itemRef);
        const fileName = itemRef.name;

        // Determinar si es una imagen o un video
        const isImage = /\.(jpg|jpeg|png|gif)$/i.test(fileName);
        const isVideo = /\.(mp4|webm|ogg)$/i.test(fileName);

        let mediaElement = '';
        if (isImage) {
          mediaElement = `<img src="${url}" alt="${fileName}" class="img-thumbnail" style="width: 100px; height: auto; cursor: pointer;" />`;
        } else if (isVideo) {
          mediaElement = `
            <video controls style="width: 100px; height: auto; cursor: pointer;">
              <source src="${url}" type="video/mp4">
              Tu navegador no soporta el elemento de video.
            </video>
          `;
        } else {
          mediaElement = '<p>Formato de archivo no compatible.</p>';
        }

        // Crear un contenedor para cada evento
        const eventElement = document.createElement('div');
        eventElement.classList.add('mb-2');
        eventElement.innerHTML = `
          <p>${removeFileExtension(fileName)}</p>
          ${mediaElement}
        `;
        oldEventsContent.appendChild(eventElement);

        // Agregar evento de clic para ampliar la imagen/video
        const mediaElementNode = eventElement.querySelector('img, video');
        if (mediaElementNode) {
          mediaElementNode.addEventListener('click', () => showEventMedia(url, fileName)); // Pasar el nombre completo
        }
      } catch (error) {
        console.error('Error al obtener el URL del evento:', error);
      }
    }
  } catch (error) {
    console.error('Error al cargar los eventos anteriores:', error);
    oldEventsContent.innerHTML = '<p>No se pudieron cargar los eventos anteriores. Inténtalo de nuevo más tarde.</p>';
  }
}

// Función para mostrar la imagen/video ampliada en un modal
function showEventMedia(mediaUrl, fileName) {
  const eventMediaContent = document.getElementById('eventMediaContent');
  const eventMediaModalLabel = document.getElementById('eventMediaModalLabel');

  // Determinar si es una imagen o un video usando el nombre completo del archivo
  const isImage = /\.(jpg|jpeg|png|gif)$/i.test(fileName);
  const isVideo = /\.(mp4|webm|ogg)$/i.test(fileName);

  let mediaElement = '';
  if (isImage) {
    mediaElement = `<img src="${mediaUrl}" alt="${fileName}" class="img-fluid" />`;
  } else if (isVideo) {
    mediaElement = `
      <video controls class="w-100">
        <source src="${mediaUrl}" type="video/mp4">
        Tu navegador no soporta el elemento de video.
      </video>
    `;
  } else {
    mediaElement = '<p>Formato de archivo no compatible.</p>';
  }

  // Mostrar el contenido en el modal
  eventMediaModalLabel.textContent = removeFileExtension(fileName); // Mostrar el nombre sin extensión
  eventMediaContent.innerHTML = mediaElement;

  // Abrir el modal
  const eventMediaModal = new bootstrap.Modal(document.getElementById('eventMediaModal'));
  eventMediaModal.show();
}

// Asignar eventos a los botones
document.getElementById('openEventsButton').addEventListener('click', () => {
  const eventsModal = new bootstrap.Modal(document.getElementById('eventsModal'));
  loadCurrentEvent(); // Cargar el evento más reciente
  eventsModal.show();
});

document.getElementById('showOldEventsButton').addEventListener('click', () => {
  const oldEventsList = document.getElementById('oldEventsList');
  const oldEventsContent = document.getElementById('oldEventsContent');

  if (oldEventsList.style.display === 'none') {
    oldEventsList.style.display = 'block';
    loadOldEvents(); // Cargar eventos viejos
  } else {
    oldEventsList.style.display = 'none';
  }
});





// Función para eliminar la extensión del archivo
function removeFileExtension(fileName) {
  return fileName.replace(/\.[^/.]+$/, ""); // Elimina todo después del último punto
}



//////////////////////////////////
// Función para emviar mensajes
/////////////////////////////////
// Función para mostrar la alerta flotante
function showSuccessNotification() {
  const successNotification = document.getElementById('successNotification');
  successNotification.style.display = 'block';

  // Ocultar la alerta después de 5 segundos
  setTimeout(() => {
    successNotification.style.display = 'none';
  }, 3000); // 3000 ms = 5 segundos
}

// Manejar el envío del formulario
document.getElementById('contactForm').addEventListener('submit', async function (e) {
  e.preventDefault(); // Evita que el formulario se envíe de forma tradicional

  const form = e.target;
  const formData = new FormData(form);

  // Mostrar un indicador de carga (opcional)
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Enviando...';

  try {
    const response = await fetch('https://formsubmit.co/ajax/fundacionmisionvida7@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(Object.fromEntries(formData))
    });

    if (response.ok) {
      // Obtener la instancia del modal
      const contactModalElement = document.getElementById('contactModal');
      const contactModal = bootstrap.Modal.getInstance(contactModalElement) || new bootstrap.Modal(contactModalElement);

      // Cerrar el modal
      contactModal.hide();

      // Esperar a que el modal se cierre completamente
      contactModalElement.addEventListener('hidden.bs.modal', () => {
        // Mostrar la alerta flotante
        showSuccessNotification();

        // Limpiar el formulario
        form.reset();

        // Reactivar la página (si hay un overlay, eliminarlo)
        const overlay = document.getElementById('overlay');
        if (overlay) {
          overlay.classList.remove('active');
          document.body.style.overflow = '';
        }
      }, { once: true });
    } else {
      // Mostrar mensaje de error dentro del modal
      document.getElementById('errorMessage').style.display = 'block';
    }
  } catch (error) {
    console.error('Error al enviar el formulario:', error);
    document.getElementById('errorMessage').style.display = 'block';
  } finally {
    // Restaurar el botón de envío
    submitButton.disabled = false;
    submitButton.textContent = 'Enviar';
  }
});




/////////////////////////////////////////////////////////////////////////////////
// Mostrar la alerta flotante y cerrarla automáticamente después de 3 segundos
////////////////////////////////////////////////////////////////////////////////
function showPrayerSuccessNotification() {
  const successNotification = document.getElementById('prayerSuccessNotification');
  successNotification.style.display = 'block';

  // Ocultar la alerta después de 5 segundos
  setTimeout(() => {
    successNotification.style.display = 'none';
  }, 3000); // 3000 ms = 5 segundos
}

// Manejar el envío del formulario de Pedidos de Oración
document.getElementById('prayerRequestForm').addEventListener('submit', async function (e) {
  e.preventDefault(); // Evita que el formulario se envíe de forma tradicional

  const form = e.target;
  const formData = new FormData(form);

  // Mostrar un indicador de carga (opcional)
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Enviando...';

  try {
    const response = await fetch('https://formsubmit.co/ajax/fundacionmisionvida7@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(Object.fromEntries(formData))
    });

    if (response.ok) {
      // Obtener la instancia del modal
      const prayerModalElement = document.getElementById('prayerRequestModal');
      const prayerModal = bootstrap.Modal.getInstance(prayerModalElement) || new bootstrap.Modal(prayerModalElement);

      // Cerrar el modal
      prayerModal.hide();

      // Esperar a que el modal se cierre completamente
      prayerModalElement.addEventListener('hidden.bs.modal', () => {
        // Mostrar la alerta flotante
        showPrayerSuccessNotification();

        // Limpiar el formulario
        form.reset();
      }, { once: true });
    } else {
      // Mostrar mensaje de error dentro del modal
      document.getElementById('prayerErrorMessage').style.display = 'block';
    }
  } catch (error) {
    console.error('Error al enviar la solicitud de oración:', error);
    document.getElementById('prayerErrorMessage').style.display = 'block';
  } finally {
    // Restaurar el botón de envío
    submitButton.disabled = false;
    submitButton.textContent = 'Enviar Solicitud';
  }
});






////////////////////////////////////////////////
// Configuración de las APIs versiculo Diario
////////////////////////////////////////////////
// Función para cargar un versículo aleatorio desde el archivo JSON
async function loadDailyVerse() {
  try {
    const response = await fetch('data/versiculos.json'); // Ajusta la ruta según donde guardes el archivo
    if (!response.ok) throw new Error('Error al cargar el archivo de versículos');
    const data = await response.json();
    const verses = data.versiculos;
    const randomIndex = Math.floor(Math.random() * verses.length);
    return verses[randomIndex];
  } catch (error) {
    console.error('Error al cargar el versículo diario:', error.message);
    return null;
  }
}

// Función para guardar el versículo en localStorage
function saveVerseToLocalStorage(verse, date) {
  localStorage.setItem('dailyVerse', JSON.stringify({ verse, date }));
}

// Función para obtener el versículo desde localStorage
function getVerseFromLocalStorage() {
  const storedVerse = localStorage.getItem('dailyVerse');
  if (storedVerse) {
    try {
      const { verse, date } = JSON.parse(storedVerse);
      const today = new Date().toISOString().split('T')[0];
      if (date === today) {
        return verse; // Devolver el versículo si es del mismo día
      }
    } catch (error) {
      console.error('Error al parsear el versículo del localStorage:', error.message);
      localStorage.removeItem('dailyVerse'); // Limpiar el valor inválido
    }
  }
  return null; // No hay versículo válido
}

// Función para configurar el modal del versículo diario
function setupDailyVerseModal() {
  const modal = new bootstrap.Modal(document.getElementById('dailyVerseModal'));
  const verseTextElement = document.getElementById('verseText');
  const verseReferenceElement = document.getElementById('verseReference');
  const toggleVersionBtn = document.getElementById('toggleVersionBtn');

  let currentVersionIndex = 0;

  // Mostrar el versículo actual en el modal
  async function showVerseInModal() {
    const today = new Date().toISOString().split('T')[0];
    let dailyVerse = getVerseFromLocalStorage();

    if (!dailyVerse) {
      dailyVerse = await loadDailyVerse();
      if (dailyVerse) {
        saveVerseToLocalStorage(dailyVerse, today);
      }
    }

    if (dailyVerse) {
      // Filtrar el versículo por referencia bíblica para encontrar ambas versiones
      const allVerses = JSON.parse(localStorage.getItem('allVerses')) || [];
      const reference = dailyVerse.referencia;
      const matchingVerses = allVerses.filter(v => v.referencia === reference);

      if (matchingVerses.length > 0) {
        currentVersionIndex = 0;
        updateModalContent(matchingVerses);
      } else {
        verseTextElement.textContent = 'No se encontraron versiones alternativas.';
      }
    } else {
      verseTextElement.textContent = 'No se pudo cargar el versículo diario.';
    }
  }

  // Función para actualizar el contenido del modal
  function updateModalContent(verses) {
    const currentVerse = verses[currentVersionIndex];
    verseTextElement.textContent = currentVerse.texto;
    verseReferenceElement.textContent = `${currentVerse.referencia} (${currentVerse.version})`;
  }

  // Evento para abrir el modal
  document.querySelector('[data-bs-target="#dailyVerseModal"]').addEventListener('click', () => {
    showVerseInModal();
    modal.show();
  });

  // Evento para cambiar la versión
  toggleVersionBtn.addEventListener('click', () => {
    const allVerses = JSON.parse(localStorage.getItem('allVerses')) || [];
    const reference = getVerseFromLocalStorage()?.referencia;
    const matchingVerses = allVerses.filter(v => v.referencia === reference);

    if (matchingVerses.length > 1) {
      currentVersionIndex = (currentVersionIndex + 1) % matchingVerses.length;
      updateModalContent(matchingVerses);
    }
  });
}

// Cargar todos los versículos al iniciar la página
async function loadAllVerses() {
  try {
    const response = await fetch('data/versiculos.json'); // Ajusta la ruta según donde guardes el archivo
    if (!response.ok) throw new Error('Error al cargar el archivo de versículos');
    const data = await response.json();
    localStorage.setItem('allVerses', JSON.stringify(data.versiculos));
  } catch (error) {
    console.error('Error al cargar todos los versículos:', error.message);
    localStorage.setItem('allVerses', JSON.stringify([])); // Guardar un array vacío en caso de error
  }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', async () => {
  await loadAllVerses(); // Cargar todos los versículos
  setupDailyVerseModal(); // Configurar el modal
});






////////////////////////////////////
// Botón de Instalación y Compartir
////////////////////////////////////

let deferredPrompt;
let installToast;
let alreadyInstalledToast;

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar elementos
  installToast = new bootstrap.Toast(document.getElementById('installToast'));
  alreadyInstalledToast = new bootstrap.Toast(document.getElementById('alreadyInstalledToast'));
  const installOptionsModal = new bootstrap.Modal('#installOptionsModal');
  const shareOptionsModal = new bootstrap.Modal('#shareOptionsModal');
  const installButton = document.getElementById('installButton');

  // Configuración inicial
  installButton.style.display = 'block';
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  if (isStandalone) {
    document.getElementById('proceedInstallButton').style.display = 'none';
    showAlreadyInstalledToast();
  }

  // Evento para mostrar opciones de instalación/compartir
  installButton.addEventListener('click', () => {
    installOptionsModal.show();
  });

  // Manejador de instalación
  document.getElementById('proceedInstallButton').addEventListener('click', async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          showInstallSuccessToast();
        }
        deferredPrompt = null;
      } catch (error) {
        console.error('Error durante la instalación:', error);
      }
    }
    installOptionsModal.hide();
  });

  // Manejador de compartir
  document.getElementById('shareAppButton').addEventListener('click', () => {
    installOptionsModal.hide();
    showShareOptions();
  });

  // Compartir nativo
  document.getElementById('nativeShareButton').addEventListener('click', () => {
    if (navigator.share) {
      navigator.share({
        title: 'Iglesia Misión Vida',
        text: 'Instala nuestra app oficial',
        url: window.location.href
      });
    } else {
      shareOptionsModal.show();
    }
  });

  // Copiar enlace
  document.getElementById('copyLinkButton').addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert('Enlace copiado al portapapeles'))
      .catch(err => console.error('Error al copiar:', err));
  });

  // Generador de QR
  const generateQR = () => {
    const qrcodeDiv = document.getElementById('qrcode');
    qrcodeDiv.innerHTML = '';
    new QRCode(qrcodeDiv, {
      text: window.location.href,
      width: 128,
      height: 128,
      colorDark: "#000",
      colorLight: "#fff",
      correctLevel: QRCode.CorrectLevel.H
    });
  };

  const showShareOptions = () => {
    generateQR();
    shareOptionsModal.show();
  };

  // Detectar capacidad de instalación
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installButton.style.display = 'block';
  });

  // Detectar instalación completada
  window.addEventListener('appinstalled', () => {
    document.getElementById('proceedInstallButton').style.display = 'none';
  });
});

// Funciones de Toast
function showInstallSuccessToast() {
  installToast.show();
  setTimeout(() => installToast.hide(), 5000);
}

function showAlreadyInstalledToast() {
  setTimeout(() => {
    alreadyInstalledToast.show();
    setTimeout(() => alreadyInstalledToast.hide(), 5000);
  }, 2000);
}










////////////////////////////////
// modal de estado de Conexion
////////////////////////////////
// Función para mostrar notificación de conexión




// Registrar Background Sync
if ('serviceWorker' in navigator && 'SyncManager' in window) {
  navigator.serviceWorker.ready.then(registration => {
    document.getElementById('openDevotionalButton').addEventListener('click', () => {
      registration.sync.register('update-palabra')
        .then(() => console.log('Sync registrado'))
        .catch(console.error);
    });
  });
}



/////////////////////////////////////////////////////////////
// ================== NOTIFICACIONES PUSH ==================
/////////////////////////////////////////////////////////////

// Función para convertir clave VAPID
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

// Configuración principal de notificaciones
document.getElementById('enableNotifications').addEventListener('click', async () => {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      showToast('Debes aceptar los permisos para recibir notificaciones', 'warning');
      return;
    }

    const swReg = await navigator.serviceWorker.ready;
    const vapidPublicKey = 'BKbz0Gk49FDvNqS78cb3W-xuCkTHmIrkGBuXQ1haspH_aKeuLl2Xdu3J_YHsORZ_JJoOxeBDPGlDrsT3ZPODstU';
    
    const subscription = await swReg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });

    await fetch('https://palabra-del-dia-backend.vercel.app/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://127.0.0.1:5500' // Especificar origen manualmente
      },
      mode: 'cors',
      body: JSON.stringify({ subscription })
    });

    if (!response.ok) throw new Error(await response.text());

    new bootstrap.Modal('#notificationActivatedModal').show();
    showToast('Notificaciones activadas exitosamente!', 'success');

  } catch (error) {
    console.error('Error:', error);
    showToast(`Error al activar: ${error.message}`, 'danger');
  }
});

// Función auxiliar para mostrar toasts
function showToast(message, type = 'success') {
  const toastEl = document.getElementById('connectionToast');
  const toastBody = document.getElementById('connectionToastBody');
  
  toastBody.className = `toast-body bg-${type} text-white rounded`;
  toastBody.innerHTML = `
    <div class="d-flex align-items-center">
      <i class="bi ${type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2"></i>
      ${message}
    </div>
  `;
  
  new bootstrap.Toast(toastEl).show();
}