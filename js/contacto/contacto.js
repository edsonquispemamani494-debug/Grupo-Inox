(() => {
  const experience = document.getElementById('branchExperience');
  if (!experience) return;

  const branches = {
    lapaz: {
      name: 'La Paz',
      manager: 'Grupo Inox',
      email: 'lapaz@grupoinox.com',
      phone: '+591 73526797',
      phoneHref: '+59173526797',
      address: 'Av. Ismael Montes, Frente a la facultad de Ciencias Economicas y Financieras, N°553, Bolivia',
      mapQuery: 'Frente a la Facultal de Economia (UMSA, Av Ismael Montes, La Paz'
    },
    elalto: {
      name: 'El Alto',
      manager: 'Grupo Inox',
      email: 'elalto@grupoinox.com',
      phone: '+591 73526797',
      phoneHref: '+59173526797',
      address: 'Av. 6 de Marzo, Zona Villa Bolivar YKK, Calle 4 N°2281, El Alto, Bolivia',
      mapQuery: 'FR8H+J2 El Alto, Bolivia'
    },
    cochabamba: {
      name: 'Cochabamba',
      manager: 'Grupo Inox',
      email: 'cochabamba@grupoinox.com',
      phone: '+591 73526797',
      phoneHref: '+59173526797',
      address: 'Av. Capitan Ustariz, Km 5 (altura surtidor), Cochabamba, Bolivia',
      mapQuery: 'JQ3W+49 Cochabamba, Bolivia'
    },
    santacruz: {
      name: 'Santa Cruz',
      manager: 'Grupo Inox',
      email: 'santacruz@grupoinox.com',
      phone: '+591 73526797',
      phoneHref: '+59173526797',
      address: 'Av. Pedro Ribera Mendez, Esq. Guayaramerin N°689, Santa Cruz de la Sierra, Bolivia',
      mapQuery: '6R9W+W3 Santa Cruz de la Sierra, Bolivia'
    },
    tarija: {
      name: 'Tarija',
      manager: 'Grupo Inox',
      email: 'tarija@grupoinox.com',
      phone: '+591 73526797',
      phoneHref: '+59173526797',
      address: 'C. Prof. Leonidas Sustach entre Av. Jaime Paz Zamora y Alberto Kisen, Tarija, Bolivia',
      mapQuery: 'F822+FM Tarija, Bolivia'
    }
  };

  const detail = document.getElementById('branchDetail');
  const markers = [...document.querySelectorAll('.branch-marker')];
  const back = document.getElementById('branchBack');
  const form = document.getElementById('branchForm');
  const feedback = document.getElementById('formFeedback');
  const googleMap = document.getElementById('googleMap');

  const nameEl = document.getElementById('branchName');
  const managerEl = document.getElementById('branchManager');
  const emailEl = document.getElementById('branchEmail');
  const phoneEl = document.getElementById('branchPhone');
  const addressEl = document.getElementById('branchAddress');
  const selectedBranch = document.getElementById('selectedBranch');

  function googleEmbed(query) {
    return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  }

  function selectBranch(key) {
    const branch = branches[key];
    if (!branch) return;

    markers.forEach(marker => {
      const active = marker.dataset.branch === key;
      marker.classList.toggle('is-active', active);
      marker.setAttribute('aria-pressed', String(active));
    });

    nameEl.textContent = branch.name;
    managerEl.textContent = branch.manager;
    emailEl.textContent = branch.email;
    emailEl.href = `mailto:${branch.email}`;
    phoneEl.textContent = branch.phone;
    phoneEl.href = `tel:${branch.phoneHref}`;
    addressEl.textContent = branch.address;
    selectedBranch.value = branch.name;
    googleMap.src = googleEmbed(branch.mapQuery);

    experience.classList.add('is-open');
    detail.setAttribute('aria-hidden', 'false');
    feedback.textContent = '';

    if (window.matchMedia('(max-width: 820px)').matches) {
      detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function closeDetail() {
    experience.classList.remove('is-open');
    detail.setAttribute('aria-hidden', 'true');
    markers.forEach(marker => {
      marker.classList.remove('is-active');
      marker.setAttribute('aria-pressed', 'false');
    });
    googleMap.src = 'about:blank';
    selectedBranch.value = '';
    feedback.textContent = '';

    if (window.matchMedia('(max-width: 820px)').matches) {
      experience.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  markers.forEach(marker => {
    marker.setAttribute('aria-pressed', 'false');
    marker.addEventListener('click', () => selectBranch(marker.dataset.branch));
  });

  back?.addEventListener('click', closeDetail);

  form?.addEventListener('submit', event => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const branch = branches[markers.find(marker => marker.classList.contains('is-active'))?.dataset.branch];
    if (!branch) return;

    const data = new FormData(form);
    const subject = `Consulta web - Grupo Inox ${branch.name}`;
    const body = [
      `Sucursal: ${branch.name}`,
      `Nombre: ${data.get('nombre') || ''}`,
      `Correo: ${data.get('correo') || ''}`,
      `Celular: ${data.get('celular') || ''}`,
      `Empresa: ${data.get('empresa') || ''}`,
      '',
      'Mensaje:',
      data.get('mensaje') || ''
    ].join('\n');

    feedback.textContent = 'Abriendo tu aplicación de correo para enviar el mensaje…';
    window.location.href = `mailto:${branch.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();
