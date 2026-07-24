/**
 * ENDIRECTE ESPECTACLES - Interactive Application Logic (Español 100%)
 * Sonorización, Iluminación, Escenarios, Discomóviles, Sillas de Plástico y Mesas Plegables de Resina.
 * Atención e interacción directa por WhatsApp con Paco Victoria.
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initCategoryTabs();
  initPortfolioFilters();
  initModals();
  initLightbox();
});

function initMobileMenu() {
  const toggle = document.querySelector('.mobile-toggle');
  const menuWrapper = document.querySelector('.nav-menu-wrapper');
  
  if (toggle && menuWrapper) {
    toggle.addEventListener('click', () => {
      menuWrapper.classList.toggle('active');
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => menuWrapper.classList.remove('active'));
    });
  }
}

function initCategoryTabs() {
  const tabBtns = document.querySelectorAll('#services-tabs .tab-btn');
  const serviceCards = document.querySelectorAll('.service-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-category');

      serviceCards.forEach(card => {
        if (cat === 'all' || card.getAttribute('data-category') === cat) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

function initPortfolioFilters() {
  const filterBtns = document.querySelectorAll('#portfolio-tabs .tab-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        if (filter === 'all' || item.getAttribute('data-tag') === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

function initLightbox() {
  const lightboxOverlay = document.getElementById('lightbox-overlay');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxTag = document.getElementById('lightbox-tag');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxClose = document.getElementById('lightbox-close');

  const galleryItems = document.querySelectorAll('.gallery-item');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const title = item.querySelector('.gallery-title');
      const tag = item.querySelector('.gallery-tag');
      const desc = item.querySelector('.gallery-desc');

      if (lightboxImg && img) {
        lightboxImg.src = img.src;
        if (lightboxTitle && title) lightboxTitle.innerText = title.innerText;
        if (lightboxTag && tag) lightboxTag.innerText = tag.innerText;
        if (lightboxDesc && desc) lightboxDesc.innerText = desc.innerText;

        lightboxOverlay.classList.add('active');
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
      lightboxOverlay.classList.remove('active');
    });
  }

  if (lightboxOverlay) {
    lightboxOverlay.addEventListener('click', (e) => {
      if (e.target === lightboxOverlay) lightboxOverlay.classList.remove('active');
    });
  }
}

function initModals() {
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose = document.getElementById('modal-close');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');

  const serviceDetailsData = {
    mesas_sillas: {
      title: "Alquiler de Sillas de Plástico y Mesas Plegables de Resina",
      body: `
        <p>Suministramos mobiliario de alquiler resistente, limpio y listo para usar:</p>
        <ul style="margin: 1rem 0; padding-left: 1.5rem;">
          <li><strong>Sillas de Plástico (Resina PVC blanca):</strong> Apilables, ligeras, súper resistentes e higiénicas. Perfectas para exterior e interior.</li>
          <li><strong>Mesas Plegables de Resina con Patas de Hierro:</strong> Las típicas mesas rectangulares plegables de resina plástica con robustas patas metálicas de hierro, ideales para banquetes, cenas de fallas, verbenas y festejos.</li>
          <li><strong>Transporte y Entrega:</strong> Entrega puntual en Gandia y cualquier localidad de La Safor, con opción de recogida posterior.</li>
        </ul>
        <p style="margin-bottom: 1.5rem;"><strong>Ideal para:</strong> Cenas de Fallas, verbenas, comisiones, banquetes populares, comuniones y fiestas privadas.</p>
        <a href="https://wa.me/34607317679?text=Hola%20Paco,%20quiero%20consultar%20alquiler%20de%20sillas%20y%20mesas" target="_blank" rel="noopener" class="btn btn-whatsapp" style="width: 100%;">
          📱 Preguntar por WhatsApp
        </a>
      `
    },
    escenarios: {
      title: "Escenarios, Tarimas, Carpas y Jaimas",
      body: `
        <p>Montajes a medida adaptados a plazas, calles y recintos festeros:</p>
        <ul style="margin: 1rem 0; padding-left: 1.5rem;">
          <li>Escenarios modulares y tarimas antideslizantes.</li>
          <li>Carpas e infraestructuras para festejos y eventos locales.</li>
          <li>Jaimas de vestuario, recepción o camerinos.</li>
          <li>WC portátiles y mobiliario para eventos.</li>
        </ul>
        <p style="margin-bottom: 1.5rem;"><strong>Servicio:</strong> Montaje, transporte y asistencia técnica durante la celebración.</p>
        <a href="https://wa.me/34607317679?text=Hola%20Paco,%20quiero%20consultar%20escenarios%20o%20carpas" target="_blank" rel="noopener" class="btn btn-whatsapp" style="width: 100%;">
          📱 Preguntar por WhatsApp
        </a>
      `
    },
    sonido: {
      title: "Equipos de Sonido e Iluminación Profesional",
      body: `
        <p>Equipos de audio e iluminación adaptados a las necesidades de cada evento:</p>
        <ul style="margin: 1rem 0; padding-left: 1.5rem;">
          <li>Megafonía para eventos deportivos (Supermotard, pruebas con chip, Trobada d'Escoles).</li>
          <li>Microfonía inalámbrica para representación teatral, sainetes y conferencias.</li>
          <li>Sonorización de música tradicional (rondalla, tabalets, dolçaina).</li>
          <li>Focos e iluminación para escenario y ambiente festero.</li>
        </ul>
        <a href="https://wa.me/34607317679?text=Hola%20Paco,%20quiero%20consultar%20sonorizaci%C3%B3n%20o%20iluminaci%C3%B3n" target="_blank" rel="noopener" class="btn btn-whatsapp" style="width: 100%; margin-top: 1rem;">
          📱 Preguntar por WhatsApp
        </a>
      `
    },
    discomovil: {
      title: "Discomóvil & Discomóvil Pirámide",
      body: `
        <p>Equipamiento completo para verbenas, fiestas de quintos, fallas y celebraciones de verano:</p>
        <ul style="margin: 1rem 0; padding-left: 1.5rem;">
          <li>Montaje especial Discomóvil Pirámide con pantalla y puente de luces.</li>
          <li>Iluminación de colores, máquinas de humo y sonido adaptado a la plaza.</li>
          <li>DJs locales con música bailable de todas las épocas.</li>
          <li>Opción de animación con gogós y pasacalles.</li>
        </ul>
        <a href="https://wa.me/34607317679?text=Hola%20Paco,%20quiero%20consultar%20la%20Discom%C3%B3vil" target="_blank" rel="noopener" class="btn btn-whatsapp" style="width: 100%; margin-top: 1rem;">
          📱 Preguntar por WhatsApp
        </a>
      `
    },
    karaoke: {
      title: "Karaoke Profesional (Distribuidor Oficial Diverkaraoke)",
      body: `
        <p>ENDIRECTE ESPECTACLES es distribuidor e instalador oficial de <strong>Diverkaraoke</strong>:</p>
        <ul style="margin: 1rem 0; padding-left: 1.5rem;">
          <li>Amplio repertorio de canciones de todos los estilos.</li>
          <li>Pantallas de apoyo y microfonía de calidad para el público.</li>
          <li>Opción de animación para dinamizar la participación.</li>
          <li>Ideal para fallas, asociaciones, restaurantes y fiestas locales.</li>
        </ul>
        <a href="https://wa.me/34607317679?text=Hola%20Paco,%20quiero%20informaci%C3%B3n%20sobre%20Diverkaraoke" target="_blank" rel="noopener" class="btn btn-whatsapp" style="width: 100%; margin-top: 1rem;">
          📱 Preguntar por WhatsApp
        </a>
      `
    },
    cine: {
      title: "Videoproyecciones, Cine de Verano y Fútbol",
      body: `
        <p>Equipos de proyección y sonido para noches de cine y actos al aire libre:</p>
        <ul style="margin: 1rem 0; padding-left: 1.5rem;">
          <li>Proyección en pantalla gigante para plazas y recintos.</li>
          <li>Retransmisión de partidos de fútbol y presentaciones municipales.</li>
          <li>Sonorización nítida y envolvente para exteriores.</li>
        </ul>
        <a href="https://wa.me/34607317679?text=Hola%20Paco,%20quiero%20consultar%20Cine%20de%20Verano" target="_blank" rel="noopener" class="btn btn-whatsapp" style="width: 100%; margin-top: 1rem;">
          📱 Preguntar por WhatsApp
        </a>
      `
    },
    infantil: {
      title: "Hinchables, Fiesta de la Espuma y Animación Infantil",
      body: `
        <p>Animaciones seguras y entretenidas para los más pequeños:</p>
        <ul style="margin: 1rem 0; padding-left: 1.5rem;">
          <li>Castillos hinchables variados con monitores.</li>
          <li>Fiesta de la espuma con cañón gigante y espuma homologada.</li>
          <li>Animación infantil, payasos y correfocs.</li>
        </ul>
        <a href="https://wa.me/34607317679?text=Hola%20Paco,%20quiero%20consultar%20hinchables%20o%20fiesta%20de%20la%20espuma" target="_blank" rel="noopener" class="btn btn-whatsapp" style="width: 100%; margin-top: 1rem;">
          📱 Preguntar por WhatsApp
        </a>
      `
    }
  };

  document.querySelectorAll('[data-service-detail]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-service-detail');
      const data = serviceDetailsData[key];
      if (data && modalOverlay) {
        modalTitle.innerText = data.title;
        modalBody.innerHTML = data.body;
        modalOverlay.classList.add('active');
      }
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', () => modalOverlay.classList.remove('active'));
  }
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.classList.remove('active');
    });
  }
}
