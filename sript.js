// ---------- FITUR EDIT FOTO ----------
const fotoImg = document.getElementById('fotoProfil');
const inputFile = document.getElementById('uploadFoto');
const fotoContainer = document.getElementById('fotoContainer');
const btnEdit = document.getElementById('btnEditFoto');
const toast = document.getElementById('toastMsg');

function showMessage(msg, isError = false) {
    toast.textContent = msg;
    toast.style.backgroundColor = isError ? '#b91c1c' : '#1e5631';
    toast.style.opacity = '1';
    setTimeout(() => {
        toast.style.opacity = '0';
    }, 2200);
}

function changeFoto(file) {
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
        showMessage('❌ Hanya file JPG/PNG yang diperbolehkan!', true);
        return;
    }
    if (file.size > 2 * 1024 * 1024) {
        showMessage('❌ Ukuran foto maksimal 2MB!', true);
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        fotoImg.src = e.target.result;
        showMessage('✅ Foto profil diperbarui!');
    };
    reader.onerror = () => showMessage('❌ Gagal membaca file.', true);
    reader.readAsDataURL(file);
}

fotoContainer.addEventListener('click', () => inputFile.click());
btnEdit.addEventListener('click', (e) => { e.stopPropagation(); inputFile.click(); });
inputFile.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) changeFoto(file);
    inputFile.value = '';
});

fotoImg.onerror = function() {
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1e5631';
    ctx.arc(60, 60, 60, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 40px "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('WH', 60, 65);
    fotoImg.src = canvas.toDataURL();
    showMessage('Foto default tidak ditemukan, menggunakan avatar sementara', false);
};

// ---------- FITUR PROJECT TAMBAHAN USER (SIMPAN KE LOCALSTORAGE) ----------
// Project default (GO-GOJEK & Pengajuan Warga) sudah langsung di index.html
// JS ini hanya mengurus project yang ditambah via tombol "Tambah Project"

let userProjects = [];

const projectContainer = document.getElementById('projectListContainer');
const btnTambah = document.getElementById('btnTambahProject');
const modal = document.getElementById('modalProject');
const btnSimpan = document.getElementById('btnSimpanProject');
const btnBatal = document.getElementById('btnBatalModal');
const inputNama = document.getElementById('projectNama');
const inputDeskripsi = document.getElementById('projectDeskripsi');
const inputLink = document.getElementById('projectLink');
const modalTitle = document.getElementById('modalTitle');

let editMode = false;
let editingId = null;

function loadProjects() {
    const stored = localStorage.getItem('wirqan_user_projects');
    userProjects = stored ? JSON.parse(stored) : [];
    renderProjects();
}

function saveProjects() {
    localStorage.setItem('wirqan_user_projects', JSON.stringify(userProjects));
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function renderProjects() {
    if (!projectContainer) return;
    if (userProjects.length === 0) {
        projectContainer.innerHTML = '';
        return;
    }
    let html = '';
    userProjects.forEach(proj => {
        const linkHTML = proj.link
            ? `<div class="project-link">
                <a href="${proj.link}" target="_blank" rel="noopener noreferrer">
                    <i class="fas fa-external-link-alt"></i> Lihat Project
                </a>
               </div>`
            : '';
        html += `
            <div class="project-item" data-id="${proj.id}">
                <div class="project-info">
                    <div class="project-nama">${escapeHtml(proj.nama)}</div>
                    <div class="project-deskripsi">${escapeHtml(proj.deskripsi)}</div>
                    ${linkHTML}
                </div>
                <button class="btn-hapus-project" data-id="${proj.id}" title="Hapus project">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
    });
    projectContainer.innerHTML = html;

    document.querySelectorAll('.btn-hapus-project').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            hapusProject(btn.getAttribute('data-id'));
        });
    });
}

function hapusProject(id) {
    if (confirm('Yakin ingin menghapus project ini?')) {
        userProjects = userProjects.filter(p => String(p.id) !== String(id));
        saveProjects();
        renderProjects();
        showMessage('✅ Project berhasil dihapus');
    }
}

function bukaModalTambah() {
    editMode = false;
    editingId = null;
    modalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Tambah Project Baru';
    inputNama.value = '';
    inputDeskripsi.value = '';
    inputLink.value = '';
    modal.style.display = 'flex';
}

function simpanProject() {
    const nama = inputNama.value.trim();
    const deskripsi = inputDeskripsi.value.trim();
    const link = inputLink.value.trim();

    if (!nama) {
        showMessage('❌ Nama project tidak boleh kosong!', true);
        return;
    }
    if (!deskripsi) {
        showMessage('❌ Deskripsi project tidak boleh kosong!', true);
        return;
    }

    if (editMode && editingId !== null) {
        const index = userProjects.findIndex(p => String(p.id) === String(editingId));
        if (index !== -1) {
            userProjects[index] = { ...userProjects[index], nama, deskripsi, link };
            showMessage('✅ Project berhasil diperbarui');
        }
    } else {
        userProjects.push({
            id: Date.now(),
            nama,
            deskripsi,
            link: link || ''
        });
        showMessage('✅ Project berhasil ditambahkan');
    }
    saveProjects();
    renderProjects();
    tutupModal();
}

function tutupModal() {
    modal.style.display = 'none';
    editMode = false;
    editingId = null;
}

btnTambah.addEventListener('click', bukaModalTambah);
btnSimpan.addEventListener('click', simpanProject);
btnBatal.addEventListener('click', tutupModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) tutupModal();
});

loadProjects();